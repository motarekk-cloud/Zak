import React from 'react';
import { Target, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { DailyProgress, UserSettings } from '../types';
import { getRubHizbDescription, simulateKhatmah } from '../utils/khatmahSimulation';
import { useTranslation, toArabicDigits } from '../utils/translations';

interface DailyProgressBarProps {
  progress: DailyProgress;
  settings: UserSettings;
  currentAyahNumber: number;
  currentHizbQuarter?: number;
  onOpenSettings: () => void;
  onOpenForecast?: () => void;
}

export const DailyProgressBar: React.FC<DailyProgressBarProps> = ({
  progress,
  settings,
  currentAyahNumber,
  currentHizbQuarter,
  onOpenForecast,
}) => {
  const t = useTranslation(settings.language);
  const readCount = progress.readAyahsCount;
  const targetAyahs = settings.dailyTarget || 26;
  const targetMultiplier = settings.targetRubHizb || 1;
  const rawPercent = (readCount / targetAyahs) * 100;
  const percent = Math.min(100, Math.round(rawPercent));
  const isGoalAchieved = readCount >= targetAyahs;
  const targetDescription = getRubHizbDescription(targetMultiplier);

  const simulation = simulateKhatmah({
    currentAyahNumber,
    targetRubHizb: targetMultiplier,
    hizbQuarter: currentHizbQuarter,
  });

  const readDisplay = settings.language === 'ar' ? toArabicDigits(readCount) : readCount;
  const targetDisplay = settings.language === 'ar' ? toArabicDigits(targetAyahs) : targetAyahs;
  const percentDisplay = settings.language === 'ar' ? `${toArabicDigits(percent)}%` : `${percent}%`;

  return (
    <div className="w-full max-w-2xl px-1">
      <button
        id="graphic-progress-bar-btn"
        type="button"
        onClick={onOpenForecast}
        className="w-full group text-start transition-all p-2 rounded-xl hover:bg-stone-100/70 dark:hover:bg-stone-900/60 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
        title={t('khatmahForecast')}
      >
        {/* Top Micro Label Row */}
        <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            {isGoalAchieved ? (
              <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 dark:fill-emerald-950" />
                <span>
                  {t('targetMet')} ({readDisplay}/{targetDisplay})
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-stone-600 dark:text-stone-300">
                <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {readDisplay} / {targetDisplay} {t('ayah')}
                </span>
                <span className="text-stone-400 text-[11px] hidden sm:inline">
                  ({settings.language === 'ar' ? targetDescription.arabic : targetDescription.english})
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <span>{percentDisplay}</span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="hidden sm:inline text-stone-500 dark:text-stone-400">
              {t('khatmah')}: {simulation.relativeTimeText}
            </span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* The Graphic Bar */}
        <div className="relative w-full h-2 sm:h-2.5 bg-stone-200/80 dark:bg-stone-800 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out relative ${
              isGoalAchieved
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-xs shadow-emerald-500/40'
                : 'bg-gradient-to-r from-emerald-600 to-teal-400'
            }`}
            style={{ width: `${Math.max(2, percent)}%` }}
          >
            {/* Shimmer light effect */}
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </button>
    </div>
  );
};
