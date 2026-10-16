import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Info, Loader2, RotateCw } from 'lucide-react';
import { Ayah, UserSettings } from '../types';
import { AyahEndOrnament } from './AyahEndOrnament';
import { formatSurahName, useTranslation, toArabicDigits } from '../utils/translations';

interface AyahCardProps {
  ayah: Ayah | null;
  loading: boolean;
  settings: UserSettings;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
  audioError: boolean;
  onForceRefresh?: () => void;
}

export const AyahCard: React.FC<AyahCardProps> = ({
  ayah,
  loading,
  settings,
  isPlayingAudio,
  onToggleAudio,
  audioError,
  onForceRefresh,
}) => {
  const [copied, setCopied] = useState(false);
  const t = useTranslation(settings.language);

  // Font size classes based on settings
  const arabicFontSizeClass =
    settings.arabicFontSize === 'huge'
      ? 'text-2xl sm:text-4xl md:text-5xl leading-[2.3]'
      : settings.arabicFontSize === 'large'
      ? 'text-xl sm:text-3xl md:text-4xl leading-[2.2]'
      : 'text-lg sm:text-2xl md:text-3xl leading-[2.1]';

  const handleCopy = () => {
    if (!ayah) return;
    const textToCopy = `${ayah.text} ۝${ayah.numberInSurah}\n— ${formatSurahName(ayah.surah.name, settings.language)} [${ayah.surah.number}:${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !ayah) {
    return (
      <div className="w-full flex-1 min-h-[220px] max-h-[460px] bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
        <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
          {t('loadingAyah')}
        </p>
      </div>
    );
  }

  if (!ayah) {
    return null;
  }

  const surahDisplayName =
    settings.language === 'en'
      ? `Surah ${ayah.surah.englishName}`
      : formatSurahName(ayah.surah.name, 'ar');

  return (
    <article className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden transition-all flex flex-col justify-between">
      {/* Decorative top accent border */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

      {/* Card Header: Surah and Ayah Metadata */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
            {surahDisplayName}
          </h2>
          <p className="text-[11px] text-stone-400 font-medium mt-0.5">
            {settings.language === 'en'
              ? `Verse ${ayah.numberInSurah} of ${ayah.surah.numberOfAyahs} • Juz ${ayah.juz}`
              : `الآية ${toArabicDigits(ayah.numberInSurah)} من ${toArabicDigits(ayah.surah.numberOfAyahs)} • الجزء ${toArabicDigits(ayah.juz)}`}
          </p>
        </div>

        {/* Right audio/copy actions */}
        <div className="flex items-center gap-1.5">
          {/* Audio Recitation Button */}
          {ayah.audioUrl && (
            <button
              id="audio-recite-btn"
              onClick={onToggleAudio}
              disabled={audioError}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                isPlayingAudio
                  ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/40 animate-pulse'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:text-emerald-700'
              } ${audioError ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isPlayingAudio ? t('pauseAudio') : t('listenAudio')}
              aria-label="Audio Recitation"
            >
              {audioError ? (
                <VolumeX className="w-3.5 h-3.5 text-stone-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Copy button */}
          <button
            id="copy-ayah-btn"
            onClick={handleCopy}
            className="p-1.5 sm:p-2 rounded-lg border bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:text-emerald-700 transition-colors"
            title={t('copyAyah')}
            aria-label="Copy Ayah"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Body: Official King Fahd Complex Arabic Text with End-of-Ayah Ornament */}
      <div className="px-4 sm:px-8 py-5 sm:py-8 bg-stone-50/40 dark:bg-stone-900/40 flex flex-col items-center justify-center text-center overflow-y-auto max-h-[38vh]">
        {/* Authentic Surah Header Basmalah (when on Ayah 1 of any Surah except Al-Fatihah & At-Tawbah) */}
        {ayah.numberInSurah === 1 && ayah.surah.number !== 1 && ayah.surah.number !== 9 && (
          <div className="mb-4 sm:mb-5 flex flex-col items-center justify-center select-none">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200 shadow-2xs">
              <span className="font-quran text-base sm:text-lg tracking-normal font-normal" dir="rtl" lang="ar">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </span>
            </div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent mt-2" />
          </div>
        )}

        {/* Verse text */}
        <div
          dir="rtl"
          lang="ar"
          className={`w-full font-quran text-stone-900 dark:text-stone-100 ${arabicFontSizeClass} font-normal tracking-wide text-center select-text selection:bg-emerald-500/20`}
        >
          {ayah.text}
          {/* Authentic Islamic End of Ayah Ornament with verse number inside */}
          <AyahEndOrnament
            numberInSurah={ayah.numberInSurah}
            language={settings.language}
          />
        </div>

        {/* Audio status banner if playing */}
        {isPlayingAudio && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            {t('reciterName')}
          </div>
        )}
      </div>

      {/* Transliteration (only if user explicitly turned on in settings) */}
      {settings.showTransliteration && ayah.transliteration && (
        <div className="px-4 sm:px-6 py-2 bg-amber-50/40 dark:bg-amber-950/20 border-t border-amber-200/40 dark:border-amber-900/30 text-xs text-stone-600 dark:text-stone-300 italic font-medium">
          <span className="text-[10px] uppercase tracking-wider not-italic text-amber-700 dark:text-amber-400 font-semibold mr-1.5">
            Transliteration:
          </span>
          {ayah.transliteration}
        </div>
      )}

      {/* Translation (only if user explicitly turned on in settings) */}
      {settings.showTranslation && ayah.translation && (
        <div className="px-4 sm:px-6 py-3 border-t border-stone-100 dark:border-stone-800/80 bg-white dark:bg-stone-900 text-left">
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
            "{ayah.translation}"
          </p>
        </div>
      )}

      {/* Card Footer: Clean King Fahd Complex attribution with verified indicator */}
      <div className="px-4 sm:px-6 py-2 bg-stone-50/80 dark:bg-stone-900/80 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="موثق" />
          <Info className="w-3 h-3 text-emerald-600/70 shrink-0" />
          <span>
            {settings.language === 'en'
              ? 'King Fahd Glorious Quran Complex (Verified)'
              : 'مصحف مجمع الملك فهد لطباعة المصحف الشريف (موثق)'}
          </span>
          {onForceRefresh && (
            <button
              onClick={onForceRefresh}
              title={settings.language === 'en' ? 'Re-verify with official source' : 'إعادة التحقق من المصدر الرسمي'}
              className="ml-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 p-0.5 rounded transition-transform active:rotate-180"
            >
              <RotateCw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
        <div>
          {ayah.page ? (settings.language === 'en' ? `Page ${ayah.page}` : `صفحة ${toArabicDigits(ayah.page)}`) : ''}
        </div>
      </div>
    </article>
  );
};
