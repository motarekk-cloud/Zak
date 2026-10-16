import React, { useState } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  ChevronRight,
  Compass,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { UserSettings, AppLanguage } from '../types';
import {
  RUB_HIZB_PRESETS,
  simulateKhatmah,
  getRubHizbDescription,
  TOTAL_RUB_AL_HIZB,
  formatReadingDuration,
} from '../utils/khatmahSimulation';
import { TOTAL_QURAN_AYAHS } from '../data/surahs';
import { useTranslation, toArabicDigits } from '../utils/translations';

interface KhatmahForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAyahNumber: number;
  currentHizbQuarter?: number;
  settings: UserSettings;
  onUpdateTarget?: (targetRubHizb: number) => void;
}

export const KhatmahForecastModal: React.FC<KhatmahForecastModalProps> = ({
  isOpen,
  onClose,
  currentAyahNumber,
  currentHizbQuarter,
  settings,
  onUpdateTarget,
}) => {
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(
    settings.targetRubHizb || 1
  );

  const t = useTranslation(settings.language);

  if (!isOpen) return null;

  const simulation = simulateKhatmah({
    currentAyahNumber,
    targetRubHizb: selectedMultiplier,
    hizbQuarter: currentHizbQuarter,
    language: settings.language,
  });

  const activeDescription = getRubHizbDescription(selectedMultiplier);
  const quranPercent = settings.language === 'ar'
    ? toArabicDigits(((currentAyahNumber / TOTAL_QURAN_AYAHS) * 100).toFixed(1))
    : ((currentAyahNumber / TOTAL_QURAN_AYAHS) * 100).toFixed(1);

  const handleApply = () => {
    if (onUpdateTarget) {
      onUpdateTarget(selectedMultiplier);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  {t('khatmahTitle')}
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  {settings.language === 'ar' ? 'ربع حزب' : 'Hizb Quarter'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('khatmahSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Forecast Hero Box */}
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white shadow-lg shadow-emerald-950/20">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {t('expectedKhatmahDate')}
                </span>
                <span className="text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-2.5 py-0.5 rounded-full">
                  {simulation.relativeTimeText}
                </span>
              </div>

              {/* Expected Date Display */}
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                {simulation.expectedCompletionFormatted}
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
                {settings.language === 'ar'
                  ? `بالمحافظة على ورد يومي بمقدار ${activeDescription.arabic} (${formatReadingDuration(simulation.estimatedDailyMinutes, 'ar')})، من المتوقع ختم القرآن الكريم كاملاً خلال ${toArabicDigits(simulation.daysRemaining)} يوماً.`
                  : `By maintaining a daily target of ${activeDescription.english} (${formatReadingDuration(simulation.estimatedDailyMinutes, 'en')}), you are projected to complete the entire Quran in ${simulation.daysRemaining} days.`}
              </p>

              {/* Progress Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-emerald-800/60">
                <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[11px] text-emerald-300/80 font-medium">{t('dailyTarget')}</div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {formatReadingDuration(simulation.estimatedDailyMinutes, settings.language)}
                  </div>
                  <div className="text-[10px] text-emerald-400/70">{activeDescription.subtext}</div>
                </div>

                <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[11px] text-emerald-300/80 font-medium">{settings.language === 'ar' ? 'الوقت المتوقع' : 'Expected Pace'}</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    ~{settings.language === 'ar' ? toArabicDigits(simulation.estimatedDailyMinutes) : simulation.estimatedDailyMinutes} {settings.language === 'ar' ? 'دقيقة' : 'mins'}
                  </div>
                  <div className="text-[10px] text-emerald-400/70">{settings.language === 'ar' ? 'قراءة معتدلة' : 'moderate pace'}</div>
                </div>

                <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[11px] text-emerald-300/80 font-medium">{settings.language === 'ar' ? 'الموضع الحالي' : 'Position'}</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {settings.language === 'ar' ? `الربع ${toArabicDigits(simulation.currentQuarter)}` : `Quarter ${simulation.currentQuarter}`}
                  </div>
                  <div className="text-[10px] text-emerald-400/70">
                    {settings.language === 'ar' ? `الجزء ${toArabicDigits(simulation.currentJuz)}` : `Juz ${simulation.currentJuz}`} ({quranPercent}%)
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-2.5 backdrop-blur-xs">
                  <div className="text-[11px] text-emerald-300/80 font-medium">{settings.language === 'ar' ? 'معدل سنوي' : 'Yearly'}</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {settings.language === 'ar' ? `${toArabicDigits(Number(simulation.khatmahsPerYear))} ختمات` : `${simulation.khatmahsPerYear} Khatmahs`}
                  </div>
                  <div className="text-[10px] text-emerald-400/70">{settings.language === 'ar' ? 'في السنة' : 'per year'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Multiplier Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                {t('targetSection')}
              </label>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {formatReadingDuration(simulation.estimatedDailyMinutes, settings.language)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {RUB_HIZB_PRESETS.map((preset) => {
                const isSelected = selectedMultiplier === preset.multiplier;
                return (
                  <button
                    key={preset.multiplier}
                    type="button"
                    onClick={() => setSelectedMultiplier(preset.multiplier)}
                    className={`p-3 rounded-2xl border text-start transition-all relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-600/30'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {settings.language === 'ar' ? preset.labelAr : preset.labelEn}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 flex items-center justify-between">
                      <span>
                        {formatReadingDuration(preset.estMinutes, settings.language)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Multiplier Fine-tuning (Unlimited Quarters) */}
            <div className="mt-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {t('customMultiplier')}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {settings.language === 'ar'
                    ? `${toArabicDigits(selectedMultiplier)} ربع حزب • ${activeDescription.arabic}`
                    : `${selectedMultiplier} Quarters • ${activeDescription.english}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMultiplier(Math.max(1, selectedMultiplier - 1))}
                  disabled={selectedMultiplier <= 1}
                  className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40 transition-colors flex items-center justify-center text-base"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={selectedMultiplier}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed) && parsed >= 1) {
                      setSelectedMultiplier(parsed);
                    }
                  }}
                  className="w-14 text-center font-bold text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg py-1 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setSelectedMultiplier(selectedMultiplier + 1)}
                  className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center justify-center text-base"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Khatmah Milestones Roadmap */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {t('milestonesTitle')}
            </h3>

            <div className="space-y-2.5">
              {simulation.milestones.map((milestone) => (
                <div
                  key={milestone.percent}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                    milestone.isPassed
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        milestone.isPassed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {milestone.isPassed ? <CheckCircle2 className="w-5 h-5" /> : `${milestone.percent}%`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                          {settings.language === 'ar' ? milestone.labelAr : milestone.labelEn}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {settings.language === 'ar'
                          ? `الربع ${toArabicDigits(milestone.quarter)} من ٢٤٠ (الجزء ${toArabicDigits(milestone.juz)})`
                          : `Quarter ${milestone.quarter} / 240 (Juz ${milestone.juz})`}
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    {milestone.isPassed ? (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full">
                        {settings.language === 'ar' ? 'تم الإنجاز' : 'Completed'}
                      </span>
                    ) : (
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {milestone.projectedDateFormatted}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {settings.language === 'ar'
                            ? `خلال ${toArabicDigits(milestone.daysFromNow)} يوماً`
                            : `in ${milestone.daysFromNow} days`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            {t('close')}
          </button>

          {onUpdateTarget && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <span>{t('saveSettings')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
