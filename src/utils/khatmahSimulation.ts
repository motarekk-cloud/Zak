import { TOTAL_QURAN_AYAHS } from '../data/surahs';

export const TOTAL_RUB_AL_HIZB = 240; // 60 Ahzab * 4 Quarters
export const TOTAL_HIZB = 60;
export const TOTAL_JUZ = 30;
export const AYAHS_PER_RUB = TOTAL_QURAN_AYAHS / TOTAL_RUB_AL_HIZB; // ~25.983 (26 ayahs)

export interface RubHizbPreset {
  multiplier: number; // Multiples of ربع حزب (1, 2, 3, 4, 8, etc.)
  labelAr: string;
  labelEn: string;
  sublabelAr: string;
  approxAyahs: number;
  fullKhatmahDays: number;
  estMinutes: number;
  badge?: string;
}

export const MAX_RUB_MULTIPLIER = 8; // Max 1 Juz (8 Hizb Quarters)

export const RUB_HIZB_PRESETS: RubHizbPreset[] = [
  {
    multiplier: 1,
    labelAr: 'ربع حزب',
    labelEn: '1 Hizb Quarter',
    sublabelAr: 'ثُمن جزء',
    approxAyahs: 26,
    fullKhatmahDays: 240,
    estMinutes: 8,
    badge: '8 Months',
  },
  {
    multiplier: 2,
    labelAr: 'نصف حزب',
    labelEn: 'Half Hizb',
    sublabelAr: 'ربع جزء',
    approxAyahs: 52,
    fullKhatmahDays: 120,
    estMinutes: 16,
    badge: '4 Months',
  },
  {
    multiplier: 3,
    labelAr: '٣ أرباع حزب',
    labelEn: '3 Hizb Quarters',
    sublabelAr: 'ثلاثة أثمان جزء',
    approxAyahs: 78,
    fullKhatmahDays: 80,
    estMinutes: 24,
    badge: '2.7 Months',
  },
  {
    multiplier: 4,
    labelAr: 'حزب كامل',
    labelEn: '1 Full Hizb',
    sublabelAr: 'نصف جزء',
    approxAyahs: 104,
    fullKhatmahDays: 60,
    estMinutes: 32,
    badge: '2 Months',
  },
  {
    multiplier: 8,
    labelAr: 'جزء كامل',
    labelEn: '1 Full Juz',
    sublabelAr: 'حزبان كاملان',
    approxAyahs: 208,
    fullKhatmahDays: 30,
    estMinutes: 60,
    badge: '1 Month Khatmah',
  },
];

export function getAyahsForRubHizb(rubMultiplier: number): number {
  return Math.max(1, Math.round(rubMultiplier * AYAHS_PER_RUB));
}

export function formatReadingDuration(
  minutes: number,
  language: 'ar' | 'en' = 'ar',
  includePace: boolean = false
): string {
  if (language === 'ar') {
    const arabicDigits = (n: number | string) =>
      String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
    let baseTime = '';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      if (remainingMins === 0) {
        if (hours === 1) {
          baseTime = 'ساعة واحدة';
        } else if (hours === 2) {
          baseTime = 'ساعتان';
        } else if (hours >= 3 && hours <= 10) {
          baseTime = `${arabicDigits(hours)} ساعات`;
        } else {
          baseTime = `${arabicDigits(hours)} ساعة`;
        }
      } else {
        const hourStr = hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : `${arabicDigits(hours)} ساعات`;
        baseTime = `${hourStr} و${arabicDigits(remainingMins)} دقيقة`;
      }
    } else if (minutes === 8) {
      baseTime = '٨ دقائق';
    } else if (minutes === 16) {
      baseTime = '١٦ دقيقة';
    } else if (minutes === 24) {
      baseTime = '٢٤ دقيقة';
    } else if (minutes === 32) {
      baseTime = '٣٢ دقيقة';
    } else {
      baseTime = `${arabicDigits(minutes)} دقيقة`;
    }
    return includePace ? `~${baseTime} بقراءة معتدلة` : `~${baseTime}`;
  } else {
    let baseTime = '';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      if (remainingMins === 0) {
        baseTime = hours === 1 ? '1 hour' : `${hours} hours`;
      } else {
        baseTime = `${hours}h ${remainingMins}m`;
      }
    } else {
      baseTime = `${minutes} mins`;
    }
    return includePace ? `~${baseTime} (moderate pace)` : `~${baseTime}`;
  }
}

export function getRubHizbForAyahs(ayahs: number): number {
  return Math.max(1, Math.round(ayahs / AYAHS_PER_RUB));
}

export function getRubHizbDescription(multiplier: number): {
  arabic: string;
  english: string;
  subtext: string;
} {
  const found = RUB_HIZB_PRESETS.find((p) => p.multiplier === multiplier);
  if (found) {
    return {
      arabic: found.labelAr,
      english: found.labelEn,
      subtext: found.sublabelAr,
    };
  }

  const arabicDigits = (n: number | string) =>
    String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  const ajzaa = multiplier / 8;
  const isWhole = Number.isInteger(ajzaa);

  let arabic = '';
  let english = '';
  let subtext = '';

  if (isWhole) {
    if (ajzaa === 2) {
      arabic = 'جزآن كاملان';
      english = '2 Full Ajzaa';
    } else if (ajzaa >= 3 && ajzaa <= 10) {
      arabic = `${arabicDigits(ajzaa)} أجزاء كاملة`;
      english = `${ajzaa} Full Ajzaa`;
    } else {
      arabic = `${arabicDigits(ajzaa)} جزءاً كاملاً`;
      english = `${ajzaa} Full Ajzaa`;
    }
    subtext = `${arabicDigits(multiplier)} ربع حزب`;
  } else {
    arabic = `${arabicDigits(multiplier)} ربع حزب`;
    english = `${multiplier} Hizb Quarters`;
    subtext = `~${arabicDigits(ajzaa.toFixed(1))} جزء`;
  }

  return { arabic, english, subtext };
}

export interface KhatmahMilestone {
  percent: number;
  labelAr: string;
  labelEn: string;
  quarter: number;
  juz: number;
  projectedDate: Date;
  projectedDateFormatted: string;
  daysFromNow: number;
  isPassed: boolean;
}

export interface KhatmahSimulation {
  targetRubHizb: number;
  dailyAyahsTarget: number;
  currentAyahNumber: number;
  currentQuarter: number;
  currentJuz: number;
  remainingQuarters: number;
  remainingAyahs: number;
  daysRemaining: number;
  expectedCompletionDate: Date;
  expectedCompletionFormatted: string;
  relativeTimeText: string;
  fullKhatmahDays: number;
  fullKhatmahFinalDate: Date;
  fullKhatmahFormatted: string;
  estimatedDailyMinutes: number;
  khatmahsPerYear: string;
  milestones: KhatmahMilestone[];
}

export function formatSimulatedDate(date: Date, language: 'ar' | 'en' = 'ar'): string {
  if (language === 'ar') {
    return date.toLocaleDateString('ar-EG-u-nu-arab', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatLongSimulatedDate(date: Date, language: 'ar' | 'en' = 'ar'): string {
  if (language === 'ar') {
    return date.toLocaleDateString('ar-EG-u-nu-arab', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function simulateKhatmah(params: {
  currentAyahNumber: number;
  targetRubHizb: number;
  hizbQuarter?: number;
  startDate?: Date;
  language?: 'ar' | 'en';
}): KhatmahSimulation {
  const { currentAyahNumber, targetRubHizb, hizbQuarter, startDate = new Date(), language = 'ar' } = params;

  const validRubMultiplier = Math.max(1, targetRubHizb || 1);
  const dailyAyahs = getAyahsForRubHizb(validRubMultiplier);

  // Determine current Hizb Quarter (1 to 240)
  const currentQuarter =
    hizbQuarter && hizbQuarter >= 1 && hizbQuarter <= TOTAL_RUB_AL_HIZB
      ? hizbQuarter
      : Math.min(
          TOTAL_RUB_AL_HIZB,
          Math.max(1, Math.ceil((currentAyahNumber / TOTAL_QURAN_AYAHS) * TOTAL_RUB_AL_HIZB))
        );

  const currentJuz = Math.min(30, Math.max(1, Math.ceil(currentQuarter / 8)));

  const remainingQuarters = Math.max(0, TOTAL_RUB_AL_HIZB - currentQuarter + 1);
  const remainingAyahs = Math.max(0, TOTAL_QURAN_AYAHS - currentAyahNumber + 1);

  // Simulated days calculation
  const daysRemaining = Math.max(1, Math.ceil(remainingQuarters / validRubMultiplier));
  const expectedCompletionDate = new Date(startDate.getTime() + daysRemaining * 86400000);

  // Full Khatmah from Ayah 1 calculation
  const fullKhatmahDays = Math.ceil(TOTAL_RUB_AL_HIZB / validRubMultiplier);
  const fullKhatmahFinalDate = new Date(startDate.getTime() + fullKhatmahDays * 86400000);

  // Relative text description
  let relativeTimeText = '';
  const arabicDigits = (n: number | string) =>
    String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);

  if (language === 'ar') {
    if (daysRemaining === 1) {
      relativeTimeText = 'غداً';
    } else if (daysRemaining < 30) {
      relativeTimeText = `خلال ${arabicDigits(daysRemaining)} يوماً`;
    } else {
      const months = (daysRemaining / 30.4).toFixed(1);
      relativeTimeText = `خلال ${arabicDigits(daysRemaining)} يوماً (~${arabicDigits(months)} شهر)`;
    }
  } else {
    if (daysRemaining === 1) {
      relativeTimeText = 'Tomorrow';
    } else if (daysRemaining < 30) {
      relativeTimeText = `in ${daysRemaining} days`;
    } else {
      const months = (daysRemaining / 30.4).toFixed(1);
      relativeTimeText = `in ${daysRemaining} days (~${months} months)`;
    }
  }

  // Estimated daily recitation duration (~8 minutes per Rub' at moderate pace)
  const estimatedDailyMinutes = validRubMultiplier * 8;

  // Khatmahs per year
  const khatmahsPerYear = (365 / fullKhatmahDays).toFixed(1);

  // Milestones: 25% (Juz 7.5 / Quarter 60), 50% (Juz 15 / Quarter 120), 75% (Juz 22.5 / Quarter 180), 100% (Juz 30 / Quarter 240)
  const milestoneDefinitions = [
    { percent: 25, quarter: 60, juz: 7.5, labelAr: 'ربع الختمة (جزء ٧.٥)', labelEn: '25% Milestone (Juz 7.5)' },
    { percent: 50, quarter: 120, juz: 15, labelAr: 'نصف الختمة (جزء ١٥)', labelEn: '50% Milestone (Juz 15)' },
    { percent: 75, quarter: 180, juz: 22.5, labelAr: 'ثلاثة أرباع الختمة (جزء ٢٢.٥)', labelEn: '75% Milestone (Juz 22.5)' },
    { percent: 100, quarter: 240, juz: 30, labelAr: 'ختم القرآن الكريم كاملاً', labelEn: 'Final Khatmah (Juz 30)' },
  ];

  const milestones: KhatmahMilestone[] = milestoneDefinitions.map((m) => {
    const isPassed = currentQuarter >= m.quarter;
    const quartersToMilestone = Math.max(0, m.quarter - currentQuarter);
    const daysToMilestone = isPassed ? 0 : Math.ceil(quartersToMilestone / validRubMultiplier);
    const milestoneDate = new Date(startDate.getTime() + daysToMilestone * 86400000);

    return {
      percent: m.percent,
      labelAr: m.labelAr,
      labelEn: m.labelEn,
      quarter: m.quarter,
      juz: m.juz,
      projectedDate: milestoneDate,
      projectedDateFormatted: formatSimulatedDate(milestoneDate, language),
      daysFromNow: daysToMilestone,
      isPassed,
    };
  });

  return {
    targetRubHizb: validRubMultiplier,
    dailyAyahsTarget: dailyAyahs,
    currentAyahNumber,
    currentQuarter,
    currentJuz,
    remainingQuarters,
    remainingAyahs,
    daysRemaining,
    expectedCompletionDate,
    expectedCompletionFormatted: formatLongSimulatedDate(expectedCompletionDate, language),
    relativeTimeText,
    fullKhatmahDays,
    fullKhatmahFinalDate,
    fullKhatmahFormatted: formatLongSimulatedDate(fullKhatmahFinalDate, language),
    estimatedDailyMinutes,
    khatmahsPerYear,
    milestones,
  };
}
