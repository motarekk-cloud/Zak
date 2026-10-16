import { DailyProgress, UserSettings, AppState, MobileUserProfile, Bookmark } from '../types';
import { getAyahsForRubHizb, getRubHizbForAyahs } from '../utils/khatmahSimulation';

const SETTINGS_KEY = 'quran_reader_settings';
const PROGRESS_KEY = 'quran_reader_daily_progress';
const STATE_KEY = 'quran_reader_app_state';
const BACKUP_CHECKPOINT_KEY = 'quran_master_checkpoint_backup';
const MOBILE_PROFILES_KEY = 'quran_mobile_profiles_v1';
const ACTIVE_MOBILE_KEY = 'quran_active_mobile_number';
const BOOKMARKS_KEY = 'quran_saved_bookmarks';

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'ar', // Arabic by default
  dailyTarget: 26, // 1 ربع حزب ≈ 26 ayahs
  targetRubHizb: 1, // 1 ربع حزب
  readingMode: 'sequential',
  arabicFontSize: 'large',
  showTranslation: false, // Default to false as requested: remove english description under ayah
  showTransliteration: false,
  autoPlayAudio: false,
  volumeButtonEnabled: true, // Support next ayah via volume up button
  hapticFeedback: true, // Subtle vibration feedback on actions
  theme: 'light',
};

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Requests browser persistent storage permission to prevent data eviction
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      if (navigator.storage.persisted) {
        const check = await navigator.storage.persisted();
        console.log(`[Storage] Persistent storage granted: ${check || isPersisted}`);
      }
      return isPersisted;
    }
  } catch (err) {
    console.warn('[Storage] Persistence request warning:', err);
  }
  return false;
}

// Simple IndexedDB fallback layer
const DB_NAME = 'QuranAppPersistenceDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction('store', 'readwrite');
    tx.objectStore('store').put(value, key);
  } catch {
    // ignore
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction('store', 'readonly');
      const req = tx.objectStore('store').get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const targetRubHizb = parsed.targetRubHizb ?? (parsed.dailyTarget ? getRubHizbForAyahs(parsed.dailyTarget) : 1);
      const dailyTarget = parsed.dailyTarget ?? getAyahsForRubHizb(targetRubHizb);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        hapticFeedback: parsed.hapticFeedback ?? true,
        targetRubHizb,
        dailyTarget,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    idbSet(SETTINGS_KEY, settings);
  } catch {
    // ignore
  }
}

/**
 * Multi-layer recovery for AppState:
 * Reads from primary localStorage, secondary immutable checkpoint, and IndexedDB
 * Never allows silent reset back to Ayah 1 if user has progressed!
 */
export function getStoredAppState(): AppState {
  const today = getTodayKey();
  const defaultState: AppState = {
    currentAyahNumber: 1,
    history: [],
    streak: 1,
    lastActiveDate: today,
  };

  try {
    const rawState = localStorage.getItem(STATE_KEY);
    const rawBackup = localStorage.getItem(BACKUP_CHECKPOINT_KEY);

    let parsedState: AppState | null = rawState ? JSON.parse(rawState) : null;
    let parsedBackup: { currentAyahNumber: number; streak?: number; lastActiveDate?: string } | null = rawBackup ? JSON.parse(rawBackup) : null;

    if (parsedState || parsedBackup) {
      // Pick highest verified progress so progress is NEVER reset
      const ayahFromState = parsedState?.currentAyahNumber || 1;
      const ayahFromBackup = parsedBackup?.currentAyahNumber || 1;
      const maxAyahNumber = Math.max(ayahFromState, ayahFromBackup);

      let streak = parsedState?.streak || parsedBackup?.streak || 1;
      const lastDate = parsedState?.lastActiveDate || parsedBackup?.lastActiveDate || today;

      if (lastDate && lastDate !== today) {
        const last = new Date(lastDate);
        const curr = new Date(today);
        const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          streak = 1;
        }
      }

      const verifiedState: AppState = {
        currentAyahNumber: maxAyahNumber,
        history: parsedState?.history || [],
        streak,
        lastActiveDate: today,
      };

      // Keep backup in sync
      saveAppState(verifiedState);
      return verifiedState;
    }
  } catch (err) {
    console.warn('[Storage] Error loading app state:', err);
  }

  return defaultState;
}

export function saveAppState(state: AppState): void {
  try {
    // 1. Primary localStorage
    localStorage.setItem(STATE_KEY, JSON.stringify(state));

    // 2. Secondary Immutable Checkpoint (tracks highest reached ayah)
    const rawBackup = localStorage.getItem(BACKUP_CHECKPOINT_KEY);
    let prevMax = 1;
    if (rawBackup) {
      try {
        prevMax = JSON.parse(rawBackup).currentAyahNumber || 1;
      } catch {}
    }
    const safeMax = Math.max(prevMax, state.currentAyahNumber);
    localStorage.setItem(
      BACKUP_CHECKPOINT_KEY,
      JSON.stringify({
        currentAyahNumber: safeMax,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        updatedAt: new Date().toISOString(),
      })
    );

    // 3. IndexedDB persistence
    idbSet(STATE_KEY, state);
    idbSet(BACKUP_CHECKPOINT_KEY, { currentAyahNumber: safeMax, streak: state.streak });

    // 4. Also update active mobile profile if logged in
    const activePhone = getActiveMobileUser();
    if (activePhone) {
      updateMobileProfileProgress(activePhone, state.currentAyahNumber, state.streak);
    }
  } catch (err) {
    console.warn('[Storage] Error saving app state:', err);
  }
}

export function getTodayProgress(dailyTarget: number, targetRubHizb: number = 1): DailyProgress {
  const today = getTodayKey();
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}_${today}`);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyProgress;
      return {
        ...parsed,
        targetAyahs: dailyTarget,
        targetRubHizb: parsed.targetRubHizb || targetRubHizb,
      };
    }
  } catch {
    // fallback
  }

  return {
    date: today,
    readAyahsCount: 0,
    readAyahNumbers: [],
    targetAyahs: dailyTarget,
    targetRubHizb,
    completed: false,
  };
}

export function saveTodayProgress(progress: DailyProgress): void {
  try {
    localStorage.setItem(`${PROGRESS_KEY}_${progress.date}`, JSON.stringify(progress));
    idbSet(`${PROGRESS_KEY}_${progress.date}`, progress);
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// Mobile Phone Profile Management & Sync
// -------------------------------------------------------------

export function getActiveMobileUser(): string | null {
  try {
    return localStorage.getItem(ACTIVE_MOBILE_KEY);
  } catch {
    return null;
  }
}

export function setActiveMobileUser(mobileNumber: string | null): void {
  try {
    if (mobileNumber) {
      localStorage.setItem(ACTIVE_MOBILE_KEY, mobileNumber);
    } else {
      localStorage.removeItem(ACTIVE_MOBILE_KEY);
    }
  } catch {
    // ignore
  }
}

export function getAllMobileProfiles(): Record<string, MobileUserProfile> {
  try {
    const raw = localStorage.getItem(MOBILE_PROFILES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

export function getMobileProfile(mobileNumber: string): MobileUserProfile | null {
  const profiles = getAllMobileProfiles();
  return profiles[mobileNumber] || null;
}

export function getStoredMobileProfile(): MobileUserProfile | null {
  const activeNumber = getActiveMobileUser();
  if (!activeNumber) return null;
  return getMobileProfile(activeNumber);
}

export function clearMobileProfile(): void {
  setActiveMobileUser(null);
}

export function saveMobileProfile(profileOrNumber: MobileUserProfile | string, state?: AppState): MobileUserProfile {
  try {
    const profiles = getAllMobileProfiles();
    let profile: MobileUserProfile;

    if (typeof profileOrNumber === 'string') {
      const existing = profiles[profileOrNumber];
      profile = {
        mobileNumber: profileOrNumber,
        currentAyahNumber: state ? state.currentAyahNumber : (existing?.currentAyahNumber || 1),
        streak: state ? state.streak : (existing?.streak || 1),
        targetRubHizb: existing?.targetRubHizb || 1,
        dailyTarget: existing?.dailyTarget || 26,
        achievements: existing?.achievements || ['بداية الرحلة المباركة'],
        lastSyncedAt: new Date().toISOString(),
      };
    } else {
      profile = profileOrNumber;
    }

    profiles[profile.mobileNumber] = profile;
    localStorage.setItem(MOBILE_PROFILES_KEY, JSON.stringify(profiles));
    setActiveMobileUser(profile.mobileNumber);
    idbSet(MOBILE_PROFILES_KEY, profiles);
    return profile;
  } catch (err) {
    console.warn('[Storage] Failed to save mobile profile:', err);
    return typeof profileOrNumber === 'string'
      ? {
          mobileNumber: profileOrNumber,
          currentAyahNumber: 1,
          streak: 1,
          targetRubHizb: 1,
          dailyTarget: 26,
          achievements: [],
          lastSyncedAt: new Date().toISOString(),
        }
      : profileOrNumber;
  }
}

export function updateMobileProfileProgress(mobileNumber: string, currentAyahNumber: number, streak: number): void {
  const profile = getMobileProfile(mobileNumber);
  if (profile) {
    profile.currentAyahNumber = Math.max(profile.currentAyahNumber, currentAyahNumber);
    profile.streak = Math.max(profile.streak, streak);
    profile.lastSyncedAt = new Date().toISOString();
    saveMobileProfile(profile);
  }
}

// -------------------------------------------------------------
// Later / Bookmark Position Support
// -------------------------------------------------------------

export function saveBookmark(
  bookmarkOrAyah: Bookmark | number,
  surahName?: string,
  ayahInSurah?: number,
  surahNumber?: number
): Bookmark {
  let bookmark: Bookmark;
  if (typeof bookmarkOrAyah === 'number') {
    bookmark = {
      ayahNumber: bookmarkOrAyah,
      surahNumber: surahNumber || 1,
      surahName: surahName || '',
      ayahInSurah: ayahInSurah || 1,
      savedAt: new Date().toISOString(),
    };
  } else {
    bookmark = bookmarkOrAyah;
  }

  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmark));
    idbSet(BOOKMARKS_KEY, bookmark);
  } catch {}
  return bookmark;
}

export function getLatestBookmark(): Bookmark | null {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

