import React, { useState } from 'react';
import {
  X,
  Target,
  BookOpen,
  Sliders,
  Type,
  Check,
  RefreshCw,
  Sparkles,
  Volume2,
  Languages,
  ShieldCheck,
  Sun,
  Moon,
  Vibrate,
} from 'lucide-react';
import { UserSettings, AppLanguage } from '../types';
import {
  RUB_HIZB_PRESETS,
  getAyahsForRubHizb,
  getRubHizbDescription,
  simulateKhatmah,
  formatReadingDuration,
} from '../utils/khatmahSimulation';
import { useTranslation, toArabicDigits } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  currentAyahNumber: number;
  currentHizbQuarter?: number;
  onSaveSettings: (newSettings: UserSettings) => void;
  onResetTodayProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentAyahNumber,
  currentHizbQuarter,
  onSaveSettings,
  onResetTodayProgress,
}) => {
  if (!isOpen) return null;

  const [currentSettings, setCurrentSettings] = useState<UserSettings>({ ...settings });
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(
    settings.targetRubHizb || 1
  );

  const t = useTranslation(currentSettings.language);

  const handleSelectMultiplier = (multiplier: number) => {
    const validMultiplier = Math.max(1, Math.round(multiplier));
    triggerHaptic('selection', currentSettings.hapticFeedback);
    setSelectedMultiplier(validMultiplier);
    const ayahs = getAyahsForRubHizb(validMultiplier);
    setCurrentSettings((prev) => ({
      ...prev,
      targetRubHizb: validMultiplier,
      dailyTarget: ayahs,
    }));
  };

  const handleLanguageChange = (lang: AppLanguage) => {
    triggerHaptic('selection', currentSettings.hapticFeedback);
    setCurrentSettings((prev) => ({ ...prev, language: lang }));
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    triggerHaptic('selection', currentSettings.hapticFeedback);
    setCurrentSettings((prev) => ({ ...prev, theme }));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
    }
  };

  const handleClose = () => {
    // If user cancelled, restore document theme to saved settings
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
    }
    triggerHaptic('light', settings.hapticFeedback);
    onClose();
  };

  const handleSave = () => {
    triggerHaptic('selection', currentSettings.hapticFeedback);
    const ayahs = getAyahsForRubHizb(selectedMultiplier);
    onSaveSettings({
      ...currentSettings,
      targetRubHizb: selectedMultiplier,
      dailyTarget: ayahs,
    });
    onClose();
  };

  // Run live Khatmah simulation
  const simulation = simulateKhatmah({
    currentAyahNumber,
    targetRubHizb: selectedMultiplier,
    hizbQuarter: currentHizbQuarter,
    language: currentSettings.language,
  });

  const activeDescription = getRubHizbDescription(selectedMultiplier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {t('settingsTitle')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('settingsSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content (scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 0: Appearance & Language */}
          <div className="space-y-3">
            {/* Theme Toggle (Light / Dark) */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  {currentSettings.theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{t('themeSection')}</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    currentSettings.theme === 'light'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>{t('themeLight')}</span>
                  {currentSettings.theme === 'light' && <Check className="w-4 h-4 text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    currentSettings.theme === 'dark'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>{t('themeDark')}</span>
                  {currentSettings.theme === 'dark' && <Check className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            {/* Language Toggle (Arabic / English) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('languageSection')}</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('ar')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    currentSettings.language === 'ar'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-750'
                  }`}
                >
                  <span>{currentSettings.language === 'ar' ? 'العربية' : 'Arabic'}</span>
                  {currentSettings.language === 'ar' && <Check className="w-4 h-4 text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    currentSettings.language === 'en'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-750'
                  }`}
                >
                  <span>{currentSettings.language === 'ar' ? 'الإنجليزية' : 'English'}</span>
                  {currentSettings.language === 'en' && <Check className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Daily Target in Multiples of ربع حزب */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                {t('targetSection')}
              </label>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                {formatReadingDuration(simulation.estimatedDailyMinutes, currentSettings.language)}
              </span>
            </div>

            {/* Target Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
              {RUB_HIZB_PRESETS.map((preset) => {
                const isSelected = selectedMultiplier === preset.multiplier;
                return (
                  <button
                    key={preset.multiplier}
                    type="button"
                    onClick={() => handleSelectMultiplier(preset.multiplier)}
                    className={`p-3 rounded-xl border text-start transition-all relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-600/30'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {currentSettings.language === 'ar' ? preset.labelAr : preset.labelEn}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-between">
                      <span>
                        {formatReadingDuration(preset.estMinutes, currentSettings.language)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Multiplier Fine-tuning (Unlimited Quarters) */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {t('customMultiplier')}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {currentSettings.language === 'ar'
                    ? `${toArabicDigits(selectedMultiplier)} ربع حزب • ${activeDescription.arabic} • ${formatReadingDuration(simulation.estimatedDailyMinutes, 'ar')}`
                    : `${selectedMultiplier} Quarters • ${activeDescription.english} • ${formatReadingDuration(simulation.estimatedDailyMinutes, 'en')}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectMultiplier(selectedMultiplier - 1)}
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
                      handleSelectMultiplier(parsed);
                    }
                  }}
                  className="w-14 text-center font-bold text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg py-1 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleSelectMultiplier(selectedMultiplier + 1)}
                  className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center justify-center text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* Live Khatmah Simulation Card */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {t('expectedKhatmahDate')}
                </span>
                <span className="text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-2.5 py-0.5 rounded-full">
                  {simulation.relativeTimeText}
                </span>
              </div>

              {/* Expected Completion Date */}
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1.5">
                {simulation.expectedCompletionFormatted}
              </div>

              <p className="text-xs text-emerald-100/80 leading-relaxed mb-3">
                {currentSettings.language === 'ar'
                  ? `بمعدل قراءة ${activeDescription.arabic} (${formatReadingDuration(simulation.estimatedDailyMinutes, 'ar')})، ستتم الختمة بإذن الله خلال ${toArabicDigits(simulation.daysRemaining)} يوماً.`
                  : `Reading ${activeDescription.english} daily (${formatReadingDuration(simulation.estimatedDailyMinutes, 'en')}), you will complete the Quran in ~${simulation.daysRemaining} days.`}
              </p>
            </div>
          </div>

          {/* Section 2: Volume Button & Haptic Touch Controls */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="pr-2">
                  <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('volumeKeyControl')}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {t('volumeKeyControlDesc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.volumeButtonEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    triggerHaptic('selection', currentSettings.hapticFeedback);
                    setCurrentSettings((prev) => ({
                      ...prev,
                      volumeButtonEnabled: checked,
                    }));
                  }}
                  className="w-4 h-4 accent-emerald-600 rounded shrink-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Haptic Touch Feedback Toggle */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="pr-2">
                  <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-emerald-600" />
                    <span>{t('hapticFeedback')}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {t('hapticFeedbackDesc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.hapticFeedback}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setCurrentSettings((prev) => ({
                      ...prev,
                      hapticFeedback: checked,
                    }));
                    if (checked) {
                      triggerHaptic('success', true);
                    }
                  }}
                  className="w-4 h-4 accent-emerald-600 rounded shrink-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Reading Flow */}
          <div>
            <label className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              {t('readingFlow')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setCurrentSettings((prev) => ({ ...prev, readingMode: 'sequential' }))
                }
                className={`p-3.5 rounded-xl border text-start transition-all ${
                  currentSettings.readingMode === 'sequential'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {t('sequentialFlow')}
                  </span>
                  {currentSettings.readingMode === 'sequential' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {t('sequentialFlowDesc')}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentSettings((prev) => ({ ...prev, readingMode: 'random' }))
                }
                className={`p-3.5 rounded-xl border text-start transition-all ${
                  currentSettings.readingMode === 'random'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {t('randomFlow')}
                  </span>
                  {currentSettings.readingMode === 'random' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {t('randomFlowDesc')}
                </p>
              </button>
            </div>
          </div>

          {/* Section 4: Font Size */}
          <div>
            <label className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-emerald-600" />
              {t('fontSizeSection')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'huge'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setCurrentSettings((prev) => ({ ...prev, arabicFontSize: size }))
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    currentSettings.arabicFontSize === size
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {size === 'normal' ? t('fontNormal') : size === 'large' ? t('fontLarge') : t('fontHuge')}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Translation & Transliteration Toggles */}
          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 cursor-pointer">
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {t('showEnglishTranslation')}
              </span>
              <input
                type="checkbox"
                checked={currentSettings.showTranslation}
                onChange={(e) =>
                  setCurrentSettings((prev) => ({ ...prev, showTranslation: e.target.checked }))
                }
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 cursor-pointer">
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {t('showTransliteration')}
              </span>
              <input
                type="checkbox"
                checked={currentSettings.showTransliteration}
                onChange={(e) =>
                  setCurrentSettings((prev) => ({
                    ...prev,
                    showTransliteration: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </label>
          </div>

          {/* Section 6: Permanent Protection Assurance */}
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                {t('persistentStorageStatus')}
              </span>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/70 mt-0.5">
                {t('persistentStorageDesc')}
              </p>
            </div>
          </div>

          {/* Section 7: Daily progress reset */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                {t('resetToday')}
              </span>
              <p className="text-[11px] text-stone-400">
                {t('resetTodayDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetTodayProgress();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('resetToday')}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            {t('saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};
