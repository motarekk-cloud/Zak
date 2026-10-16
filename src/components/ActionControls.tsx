import React from 'react';
import { ArrowLeft, ArrowRight, Clock, Check } from 'lucide-react';
import { AppLanguage } from '../types';
import { useTranslation } from '../utils/translations';

interface ActionControlsProps {
  onRead: () => void;
  onPrevious: () => void;
  onLater: () => void;
  canGoPrevious: boolean;
  isDailyGoalMet: boolean;
  loading: boolean;
  language: AppLanguage;
  volumeButtonEnabled?: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  onRead,
  onPrevious,
  onLater,
  canGoPrevious,
  isDailyGoalMet,
  loading,
  language,
  volumeButtonEnabled = true,
}) => {
  const t = useTranslation(language);

  // In standard mobile apps:
  // - "Next" advances forward. In RTL (Arabic), "Next" advances to the left, or is placed on the leading side.
  // - The user requested: "الزراير المطلوبة هي التالى..الرجوع..لاحقا..كلهم بالرموز فقط ما عدا التالى مكتوب عليه اسمه و باللون الاخضر"
  // - Green Next Button has its label and icon.
  // - Later and Previous (الرجوع) are icons only with clean, rounded buttons.
  // - Direction of Previous (الرجوع / Back) icon:
  //   In RTL (Arabic): Back arrow points right (ArrowRight).
  //   In LTR (English): Back arrow points left (ArrowLeft).
  // - Direction of Next (التالى) icon:
  //   In RTL (Arabic): Forward arrow points left (ArrowLeft).
  //   In LTR (English): Forward arrow points right (ArrowRight).
  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const NextArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2">
      <div className="w-full max-w-2xl flex items-center justify-between gap-2 sm:gap-3">
        {/* Next Button (التالى) - Only button with text & icon, in bright green */}
        <button
          id="read-ayah-btn"
          onClick={onRead}
          disabled={loading}
          className={`flex-1 min-w-[130px] sm:min-w-[180px] px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] ${
            isDailyGoalMet
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 ring-2 ring-emerald-500/20'
              : 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-700/20'
          }`}
          title={`${t('next')} (Space / Enter / Volume Up)`}
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </div>
          <span className="tracking-wide text-sm sm:text-base font-bold">{t('next')}</span>
          <NextArrowIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
        </button>

        {/* Previous / Back Button (الرجوع) - Icon Only */}
        <button
          id="prev-ayah-btn"
          onClick={onPrevious}
          disabled={!canGoPrevious || loading}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-xs shrink-0"
          title={`${language === 'ar' ? 'الرجوع للآية السابقة' : 'Previous Verse'} (P / ←)`}
          aria-label={language === 'ar' ? 'الرجوع للآية السابقة' : 'Previous Verse'}
        >
          <BackIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
        </button>

        {/* Later Button (لاحقاً - حفظ الموضع) - Clock Icon Only */}
        <button
          id="later-ayah-btn"
          onClick={onLater}
          disabled={loading}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-all flex items-center justify-center shadow-xs shrink-0"
          title={`${t('later')} (${t('laterModalTitle')})`}
          aria-label={t('later')}
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
        </button>
      </div>

      {/* Shortcuts & Volume Button Indicator */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-stone-400 dark:text-stone-500">
        <span className="hidden sm:inline">{t('shortcuts')}:</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 font-mono text-[10px]">
            Space / Enter
          </kbd>
          <span>{t('next')}</span>
        </span>
        {volumeButtonEnabled && (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('volumeUpNextHint')}</span>
          </span>
        )}
      </div>
    </div>
  );
};
