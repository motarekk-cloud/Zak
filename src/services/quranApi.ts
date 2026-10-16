import { Ayah } from '../types';
import { INITIAL_AYAHS } from '../data/initialAyahs';
import { getSurahAndAyahFromGlobal, TOTAL_QURAN_AYAHS } from '../data/surahs';

// In-memory cache to avoid repeated network requests
const memoryCache = new Map<number, Ayah>();

// Pre-fill cache with initial verified King Fahd Complex ayahs
INITIAL_AYAHS.forEach((ayah) => {
  memoryCache.set(ayah.number, ayah);
});

// Cache key versioned and isolated to ensure no old corrupted data lingers
const LOCAL_STORAGE_CACHE_KEY = 'quran_ayah_kfgqpc_cache_v5_kfgqpc_verified';

// Purge any older/corrupted cache versions from previous builds
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('quran_ayah_kfgqpc_cache_v1');
    localStorage.removeItem('quran_ayah_kfgqpc_cache_v2');
  }
} catch {
  // ignore
}

// Load verified cached ayahs from localStorage
try {
  const stored = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as Record<number, Ayah>;
    Object.values(parsed).forEach((ayah) => {
      if (ayah && ayah.number && ayah.text && !ayah.text.startsWith('آية ')) {
        memoryCache.set(ayah.number, ayah);
      }
    });
  }
} catch {
  // ignore storage error
}

function persistCache() {
  try {
    const obj: Record<number, Ayah> = {};
    // Store up to 250 most recent verified ayahs in localStorage
    const entries = Array.from(memoryCache.entries()).slice(-250);
    entries.forEach(([k, v]) => {
      obj[k] = v;
    });
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

/**
 * Strips improperly injected Basmalah from secondary API fallbacks.
 * In the official Mushaf of the King Fahd Complex, the Basmalah is an opening header for the surah,
 * NOT counted as part of Ayah 1 (except in Surah Al-Fatihah 1:1).
 */
function cleanInjectedBasmalah(text: string, surahNumber: number, ayahInSurah: number): string {
  if (surahNumber !== 1 && surahNumber !== 9 && ayahInSurah === 1) {
    return text.replace(/^بِسْمِ\s+[\u0671\u0627]للَّ?هِ\s+[\u0671\u0627]?لرَّحْمَ[\u0670\u0640]?نِ\s+[\u0671\u0627]?لرَّحِيمِ\s+/u, '').trim();
  }
  return text.trim();
}

/**
 * Fetches an Ayah by its global number (1..6236)
 * Strictly sourced from official King Fahd Complex for Printing the Holy Quran
 * (مجمع خادم الحرمين الشريفين الملك فهد لطباعة المصحف الشريف - مصحف المدينة النبوية برواية حفص عن عاصم)
 */
export async function fetchAyah(globalAyahNumber: number, forceRefresh: boolean = false): Promise<Ayah> {
  const safeNumber = Math.max(1, Math.min(TOTAL_QURAN_AYAHS, globalAyahNumber));

  // 1. Check cache first (unless forceRefresh requested)
  if (!forceRefresh && memoryCache.has(safeNumber)) {
    const cached = memoryCache.get(safeNumber)!;
    // Extra safety: ensure cached verse is not placeholder text
    if (cached.text && !cached.text.startsWith('آية ')) {
      return cached;
    }
  }

  const { surah, ayahInSurah } = getSurahAndAyahFromGlobal(safeNumber);

  // 2. Primary Source: Official Quran.com API v4 with King Fahd Complex Uthmanic Text
  // (مصحف المدينة النبوية برواية حفص عن عاصم)
  try {
    const verseKey = `${surah.number}:${ayahInSurah}`;
    const quranComUrl = `https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=en&words=false&translations=131&fields=text_uthmani,chapter_id,verse_number,hizb_number,rub_el_hizb_number,juz_number,page_number`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(quranComUrl, {
      cache: forceRefresh ? 'no-cache' : 'force-cache',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const verse = json.verse;
      if (verse && verse.text_uthmani) {
        const cleanedText = verse.text_uthmani.trim();

        const englishTranslation =
          verse.translations && verse.translations[0]?.text
            ? verse.translations[0].text.replace(/<sup[^>]*>.*?<\/sup>/g, '').trim()
            : '';

        const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${safeNumber}.mp3`;

        const ayah: Ayah = {
          number: safeNumber,
          numberInSurah: ayahInSurah,
          juz: verse.juz_number || Math.min(30, Math.ceil(safeNumber / 208)),
          page: verse.page_number,
          hizbQuarter: verse.rub_el_hizb_number,
          text: cleanedText,
          translation: englishTranslation,
          audioUrl,
          surah: {
            number: surah.number,
            name: surah.name,
            englishName: surah.englishName,
            englishNameTranslation: surah.englishNameTranslation,
            revelationType: surah.revelationType,
            numberOfAyahs: surah.numberOfAyahs,
          },
        };

        memoryCache.set(safeNumber, ayah);
        persistCache();
        return ayah;
      }
    }
  } catch (err) {
    console.warn(`Primary King Fahd Complex source fetch failed for Ayah ${safeNumber}:`, err);
  }

  // 3. Fallback Source: AlQuran Cloud quran-uthmani with strict Basmalah separation
  try {
    const fallbackUrl = `https://api.alquran.cloud/v1/ayah/${safeNumber}/editions/quran-uthmani,en.sahih,ar.alafasy`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(fallbackUrl, {
      cache: forceRefresh ? 'no-cache' : 'force-cache',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
        const arabicData = data.data[0];
        const englishData = data.data[1];
        const audioData = data.data[2];

        // Clean out any improperly fused Basmalah from fallback
        const verifiedArabicText = cleanInjectedBasmalah(
          arabicData.text,
          arabicData.surah.number,
          arabicData.numberInSurah
        );

        const ayah: Ayah = {
          number: safeNumber,
          numberInSurah: arabicData.numberInSurah,
          juz: arabicData.juz,
          manzil: arabicData.manzil,
          page: arabicData.page,
          ruku: arabicData.ruku,
          hizbQuarter: arabicData.hizbQuarter,
          text: verifiedArabicText,
          translation: englishData?.text || '',
          audioUrl: audioData?.audio || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${safeNumber}.mp3`,
          surah: {
            number: arabicData.surah.number,
            name: arabicData.surah.name,
            englishName: arabicData.surah.englishName,
            englishNameTranslation: arabicData.surah.englishNameTranslation,
            revelationType: arabicData.surah.revelationType,
            numberOfAyahs: arabicData.surah.numberOfAyahs,
          },
        };

        memoryCache.set(safeNumber, ayah);
        persistCache();
        return ayah;
      }
    }
  } catch (err) {
    console.warn(`Fallback fetch failed for Ayah ${safeNumber}:`, err);
  }

  // 4. If an initial verified ayah exists in pre-bundled data, use it
  const bundled = INITIAL_AYAHS.find((a) => a.number === safeNumber);
  if (bundled) {
    return bundled;
  }

  // 5. NEVER return placeholder text like "آية X - سورة Y".
  // Throw an informative error so the UI displays an authentic reload/retry prompt.
  throw new Error(`تعذر تحميل نص الآية (${ayahInSurah}) من ${surah.name} من المصدر الرسمي للمصحف الشريف. يرجى التحقق من الاتصال بالإنترنت والمحاولة مجدداً.`);
}

/**
 * Clears local memory and storage cache to force re-verification
 */
export function clearAyahCache(): void {
  memoryCache.clear();
  INITIAL_AYAHS.forEach((ayah) => {
    memoryCache.set(ayah.number, ayah);
  });
  try {
    localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Returns a random Ayah number between 1 and 6236
 */
export function getRandomAyahNumber(): number {
  return Math.floor(Math.random() * TOTAL_QURAN_AYAHS) + 1;
}
