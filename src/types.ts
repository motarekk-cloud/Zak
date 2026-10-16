export interface Ayah {
  number: number; // 1 to 6236 global ayah number
  numberInSurah: number;
  juz: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  text: string; // Arabic text
  translation: string; // English translation
  transliteration?: string;
  audioUrl?: string;
  surah: {
    number: number;
    name: string; // Arabic name e.g. سُورَةُ الفَاتِحَة
    englishName: string; // e.g. Al-Faatiha
    englishNameTranslation: string; // e.g. The Opening
    revelationType: 'Meccan' | 'Medinan';
    numberOfAyahs: number;
  };
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export type ReadingMode = 'sequential' | 'random';
export type AppLanguage = 'ar' | 'en';

export interface UserSettings {
  language: AppLanguage; // 'ar' | 'en'
  dailyTarget: number; // ayahs count (synced with targetRubHizb)
  targetRubHizb: number; // Multiples of ربع حزب (1, 2, 4, 8, etc.)
  readingMode: ReadingMode;
  arabicFontSize: 'normal' | 'large' | 'huge';
  showTranslation: boolean;
  showTransliteration: boolean;
  autoPlayAudio: boolean;
  volumeButtonEnabled: boolean; // Next ayah using volume up button
  hapticFeedback: boolean; // Subtle vibration feedback on actions
  theme: 'light' | 'dark' | 'parchment';
}

export interface MobileUserProfile {
  mobileNumber: string; // formatted with country code e.g. +966501234567
  name?: string;
  pin?: string;
  currentAyahNumber: number;
  streak: number;
  targetRubHizb: number;
  dailyTarget: number;
  achievements: string[];
  lastSyncedAt: string;
}

export interface Bookmark {
  ayahNumber: number;
  surahNumber: number;
  ayahInSurah: number;
  surahName: string;
  savedAt: string;
  note?: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  readAyahsCount: number;
  readAyahNumbers: number[];
  targetAyahs: number;
  targetRubHizb: number;
  completed: boolean;
}

export interface AppState {
  currentAyahNumber: number; // 1 to 6236
  history: number[]; // read ayah numbers
  streak: number;
  lastActiveDate: string;
}
