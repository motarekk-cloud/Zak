import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DailyProgressBar } from './components/DailyProgressBar';
import { AyahCard } from './components/AyahCard';
import { ActionControls } from './components/ActionControls';
import { SettingsModal } from './components/SettingsModal';
import { SurahJumpModal } from './components/SurahJumpModal';
import { CelebrationModal } from './components/CelebrationModal';
import { KhatmahForecastModal } from './components/KhatmahForecastModal';
import { AuthModal } from './components/AuthModal';
import { LaterModal } from './components/LaterModal';
import { Ayah, UserSettings, DailyProgress, AppState, MobileUserProfile } from './types';
import { fetchAyah, getRandomAyahNumber } from './services/quranApi';
import {
  getStoredSettings,
  saveSettings,
  getStoredAppState,
  saveAppState,
  getTodayProgress,
  saveTodayProgress,
  getTodayKey,
  requestPersistentStorage,
  saveBookmark,
  getStoredMobileProfile,
  saveMobileProfile,
  clearMobileProfile,
} from './services/storage';
import { TOTAL_QURAN_AYAHS } from './data/surahs';
import { getAyahsForRubHizb } from './utils/khatmahSimulation';
import { useTranslation, toArabicDigits } from './utils/translations';
import { triggerHaptic } from './utils/haptics';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());
  const [appState, setAppState] = useState<AppState>(() => getStoredAppState());
  const [todayProgress, setTodayProgress] = useState<DailyProgress>(() =>
    getTodayProgress(settings.dailyTarget, settings.targetRubHizb)
  );

  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 3. Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLaterOpen, setIsLaterOpen] = useState(false);

  // 4. Mobile User Profile
  const [mobileProfile, setMobileProfile] = useState<MobileUserProfile | null>(() =>
    getStoredMobileProfile()
  );

  // 5. On-screen target notification dismiss tracker
  const [dismissGoalNotice, setDismissGoalNotice] = useState(false);

  // Track if celebration was shown this session
  const celebrationShownTodayRef = useRef(false);

  // Translation hook
  const t = useTranslation(settings.language);

  // Sync HTML lang and dir attributes dynamically whenever language changes
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  // Request browser storage persistence to prevent any state reset
  useEffect(() => {
    requestPersistentStorage();
  }, []);

  // Apply dark mode class to document root
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Stop audio playback safely
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setAudioError(false);
  }, []);

  // Load Ayah by global index
  const loadAyah = useCallback(
    async (number: number, forceRefresh: boolean = false) => {
      stopAudio();
      setLoading(true);
      setError(null);
      try {
        const ayah = await fetchAyah(number, forceRefresh);
        setCurrentAyah(ayah);
      } catch (err: any) {
        console.error('Failed to load ayah', err);
        setError(
          err?.message || (settings.language === 'ar'
            ? 'تعذر تحميل الآية من مصحف المدينة الرسمي. يرجى التحقق من الاتصال وإعادة المحاولة.'
            : 'Unable to load verse from official Madinah Mushaf. Please verify connection and retry.')
        );
      } finally {
        setLoading(false);
      }
    },
    [stopAudio, settings.language]
  );

  // Initial load on screen opening
  useEffect(() => {
    loadAyah(appState.currentAyahNumber);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle audio playback toggle
  const toggleAudio = useCallback(() => {
    if (!currentAyah?.audioUrl) return;

    triggerHaptic('selection', settings.hapticFeedback);

    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
      };
      audioRef.current.onerror = () => {
        setAudioError(true);
        setIsPlayingAudio(false);
      };
    }

    audioRef.current.src = currentAyah.audioUrl;
    audioRef.current
      .play()
      .then(() => {
        setIsPlayingAudio(true);
        setAudioError(false);
      })
      .catch((err) => {
        console.warn('Audio play prevented or failed:', err);
        setAudioError(true);
        setIsPlayingAudio(false);
      });
  }, [currentAyah, isPlayingAudio, stopAudio, settings.hapticFeedback]);

  // Move to next Ayah index
  const getNextAyahNumber = useCallback(() => {
    if (settings.readingMode === 'random') {
      return getRandomAyahNumber();
    }
    return appState.currentAyahNumber >= TOTAL_QURAN_AYAHS
      ? 1
      : appState.currentAyahNumber + 1;
  }, [settings.readingMode, appState.currentAyahNumber]);

  // Move to previous Ayah index
  const getPreviousAyahNumber = useCallback(() => {
    if (settings.readingMode === 'random') {
      const hist = appState.history;
      if (hist.length > 0) {
        return hist[hist.length - 1];
      }
    }
    return appState.currentAyahNumber <= 1
      ? TOTAL_QURAN_AYAHS
      : appState.currentAyahNumber - 1;
  }, [settings.readingMode, appState.currentAyahNumber, appState.history]);

  // Action: User clicks "Next" (التالى)
  const handleRead = useCallback(() => {
    const nextNumber = getNextAyahNumber();
    const newReadCount = todayProgress.readAyahsCount + 1;
    const isTargetJustMet =
      newReadCount === settings.dailyTarget && !celebrationShownTodayRef.current;

    // Trigger haptic feedback
    if (isTargetJustMet) {
      triggerHaptic('success', settings.hapticFeedback);
    } else {
      triggerHaptic('medium', settings.hapticFeedback);
    }

    // Update today's progress
    const updatedProgress: DailyProgress = {
      ...todayProgress,
      readAyahsCount: newReadCount,
      readAyahNumbers: currentAyah
        ? [...todayProgress.readAyahNumbers, currentAyah.number]
        : todayProgress.readAyahNumbers,
      completed: newReadCount >= settings.dailyTarget,
      targetRubHizb: settings.targetRubHizb,
    };
    setTodayProgress(updatedProgress);
    saveTodayProgress(updatedProgress);

    // Update app state (cursor & history)
    const updatedAppState: AppState = {
      ...appState,
      currentAyahNumber: nextNumber,
      history: currentAyah ? [...appState.history, currentAyah.number] : appState.history,
      lastActiveDate: getTodayKey(),
    };
    setAppState(updatedAppState);
    saveAppState(updatedAppState);

    // Also sync to active mobile profile if logged in
    if (mobileProfile) {
      saveMobileProfile(mobileProfile.mobileNumber, updatedAppState);
    }

    // Check celebration
    if (isTargetJustMet) {
      celebrationShownTodayRef.current = true;
      setIsCelebrationOpen(true);
      setDismissGoalNotice(false);
    }

    // Load next ayah
    loadAyah(nextNumber);
  }, [
    getNextAyahNumber,
    todayProgress,
    settings.dailyTarget,
    settings.targetRubHizb,
    settings.hapticFeedback,
    currentAyah,
    appState,
    mobileProfile,
    loadAyah,
  ]);

  // Action: User clicks "Later" (لاحقاً)
  const handleLater = useCallback(() => {
    triggerHaptic('medium', settings.hapticFeedback);
    if (currentAyah) {
      saveBookmark(
        currentAyah.number,
        currentAyah.surah.name,
        currentAyah.numberInSurah,
        currentAyah.surah.number
      );
    }
    setIsLaterOpen(true);
  }, [currentAyah, settings.hapticFeedback]);

  // Action: User clicks "Skip"
  const handleSkip = useCallback(() => {
    triggerHaptic('light', settings.hapticFeedback);
    const nextNumber = getNextAyahNumber();

    const updatedAppState: AppState = {
      ...appState,
      currentAyahNumber: nextNumber,
      lastActiveDate: getTodayKey(),
    };
    setAppState(updatedAppState);
    saveAppState(updatedAppState);

    if (mobileProfile) {
      saveMobileProfile(mobileProfile.mobileNumber, updatedAppState);
    }

    loadAyah(nextNumber);
  }, [getNextAyahNumber, appState, mobileProfile, loadAyah, settings.hapticFeedback]);

  // Action: User clicks "Previous"
  const handlePrevious = useCallback(() => {
    triggerHaptic('light', settings.hapticFeedback);
    const prevNumber = getPreviousAyahNumber();

    const updatedAppState: AppState = {
      ...appState,
      currentAyahNumber: prevNumber,
    };
    setAppState(updatedAppState);
    saveAppState(updatedAppState);

    loadAyah(prevNumber);
  }, [getPreviousAyahNumber, appState, loadAyah, settings.hapticFeedback]);

  // Jump to arbitrary ayah
  const handleJumpTo = useCallback(
    (globalAyahNumber: number) => {
      triggerHaptic('selection', settings.hapticFeedback);
      const updatedAppState: AppState = {
        ...appState,
        currentAyahNumber: globalAyahNumber,
      };
      setAppState(updatedAppState);
      saveAppState(updatedAppState);

      if (mobileProfile) {
        saveMobileProfile(mobileProfile.mobileNumber, updatedAppState);
      }

      loadAyah(globalAyahNumber);
    },
    [appState, mobileProfile, loadAyah, settings.hapticFeedback]
  );

  // Save new settings
  const handleSaveSettings = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);

    // Sync progress target
    setTodayProgress((prev) => {
      const updated: DailyProgress = {
        ...prev,
        targetAyahs: newSettings.dailyTarget,
        targetRubHizb: newSettings.targetRubHizb,
        completed: prev.readAyahsCount >= newSettings.dailyTarget,
      };
      saveTodayProgress(updated);
      return updated;
    });
  }, []);

  // Update target multiplier directly from forecast
  const handleUpdateTargetFromForecast = useCallback(
    (targetRubHizb: number) => {
      const ayahs = getAyahsForRubHizb(targetRubHizb);
      const updatedSettings: UserSettings = {
        ...settings,
        targetRubHizb,
        dailyTarget: ayahs,
      };
      handleSaveSettings(updatedSettings);
    },
    [settings, handleSaveSettings]
  );

  // Reset today's progress counter
  const handleResetToday = useCallback(() => {
    const resetProgress: DailyProgress = {
      date: getTodayKey(),
      readAyahsCount: 0,
      readAyahNumbers: [],
      targetAyahs: settings.dailyTarget,
      targetRubHizb: settings.targetRubHizb,
      completed: false,
    };
    setTodayProgress(resetProgress);
    saveTodayProgress(resetProgress);
    celebrationShownTodayRef.current = false;
    setDismissGoalNotice(false);
  }, [settings.dailyTarget, settings.targetRubHizb]);

  // Mobile User login / register sync handler
  const handleLoginWithMobile = async (mobileNumber: string) => {
    const profile = saveMobileProfile(mobileNumber, appState);
    setMobileProfile(profile);
    if (profile.currentAyahNumber && profile.currentAyahNumber !== appState.currentAyahNumber) {
      loadAyah(profile.currentAyahNumber);
    }
  };

  const handleSignOut = () => {
    clearMobileProfile();
    setMobileProfile(null);
  };

  // Theme toggle helper
  const handleToggleTheme = useCallback(() => {
    triggerHaptic('selection', settings.hapticFeedback);
    setSettings((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      const updated = { ...prev, theme: nextTheme };
      saveSettings(updated);
      return updated;
    });
  }, [settings.hapticFeedback]);

  // Keyboard and Hardware Volume Up navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Check for Hardware Volume Up Button
      const isVolumeUpKey =
        e.key === 'AudioVolumeUp' ||
        e.code === 'AudioVolumeUp' ||
        e.key === 'VolumeUp';

      if (isVolumeUpKey && settings.volumeButtonEnabled) {
        e.preventDefault();
        e.stopPropagation();
        handleRead();
        return;
      }

      // Handle Escape for all open modals
      if (
        isSettingsOpen ||
        isJumpOpen ||
        isCelebrationOpen ||
        isForecastOpen ||
        isAuthOpen ||
        isLaterOpen
      ) {
        if (e.key === 'Escape') {
          setIsSettingsOpen(false);
          setIsJumpOpen(false);
          setIsCelebrationOpen(false);
          setIsForecastOpen(false);
          setIsAuthOpen(false);
          setIsLaterOpen(false);
        }
        return;
      }

      // Standard desktop keyboard shortcuts
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleRead();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSkip();
      } else if (e.key.toLowerCase() === 'p' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSettingsOpen,
    isJumpOpen,
    isCelebrationOpen,
    isForecastOpen,
    isAuthOpen,
    isLaterOpen,
    settings.volumeButtonEnabled,
    handleRead,
    handleSkip,
    handlePrevious,
    toggleAudio,
  ]);

  const isGoalReached = todayProgress.readAyahsCount >= settings.dailyTarget;

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between font-sans transition-colors overflow-hidden">
      {/* Compact Top Header */}
      <Header
        streak={appState.streak}
        settings={settings}
        userMobile={mobileProfile?.mobileNumber}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenJump={() => setIsJumpOpen(true)}
        onOpenForecast={() => setIsForecastOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area: constrained strictly to mobile screen length */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-col justify-between items-center gap-2 overflow-hidden">
        {/* Sleek Minimal Graphic Progress Bar */}
        <DailyProgressBar
          progress={todayProgress}
          settings={settings}
          currentAyahNumber={appState.currentAyahNumber}
          currentHizbQuarter={currentAyah?.hizbQuarter}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenForecast={() => setIsForecastOpen(true)}
        />

        {/* On-screen Target Accomplished Notification Banner */}
        {isGoalReached && !dismissGoalNotice && (
          <div className="w-full max-w-2xl px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span className="font-bold">
                {settings.language === 'ar'
                  ? `ما شاء الله! أتممت وردك اليومي (${toArabicDigits(todayProgress.readAyahsCount)}/${toArabicDigits(settings.dailyTarget)} آية)`
                  : `Masha'Allah! Daily target achieved (${todayProgress.readAyahsCount}/${settings.dailyTarget} Ayahs)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsForecastOpen(true)}
                className="text-[11px] underline font-semibold text-emerald-100 hover:text-white"
              >
                {t('khatmah')}
              </button>
              <button
                type="button"
                onClick={() => setDismissGoalNotice(true)}
                className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white"
                title={settings.language === 'ar' ? 'إخفاء الإشعار' : 'Dismiss notice'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Error message if any */}
        {error && (
          <div className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => loadAyah(appState.currentAyahNumber)}
              className="px-2 py-0.5 rounded-md bg-rose-200/60 dark:bg-rose-900/60 font-semibold"
            >
              {settings.language === 'ar' ? 'إعادة' : 'Retry'}
            </button>
          </div>
        )}

        {/* Current Ayah Display Card (sized to fit mobile screen) */}
        <div className="w-full flex-1 flex flex-col justify-center min-h-0">
          <AyahCard
            ayah={currentAyah}
            loading={loading}
            settings={settings}
            isPlayingAudio={isPlayingAudio}
            onToggleAudio={toggleAudio}
            audioError={audioError}
            onForceRefresh={() => loadAyah(appState.currentAyahNumber, true)}
          />
        </div>

        {/* Action Controls: Read (Next), Previous (Back), Later */}
        <div className="w-full pt-1 pb-1">
          <ActionControls
            onRead={handleRead}
            onPrevious={handlePrevious}
            onLater={handleLater}
            canGoPrevious={appState.currentAyahNumber > 1 || appState.history.length > 0}
            isDailyGoalMet={isGoalReached}
            loading={loading}
            language={settings.language}
            volumeButtonEnabled={settings.volumeButtonEnabled}
          />
        </div>
      </main>

      {/* Ultra-slim Footer */}
      <footer className="w-full py-1 text-center text-[10px] text-stone-400 dark:text-stone-600 border-t border-stone-200/50 dark:border-stone-800/50">
        <p>
          {settings.language === 'ar'
            ? 'تطبيق وَالذَّاكِرُونَ • مصحف المدينة النبوية (مجمع الملك فهد لطباعة المصحف الشريف)'
            : 'Wa Al-Dhakirun App • King Fahd Complex for Printing of the Holy Quran'}
        </p>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        currentAyahNumber={appState.currentAyahNumber}
        currentHizbQuarter={currentAyah?.hizbQuarter}
        onSaveSettings={handleSaveSettings}
        onResetTodayProgress={handleResetToday}
      />

      <KhatmahForecastModal
        isOpen={isForecastOpen}
        onClose={() => setIsForecastOpen(false)}
        currentAyahNumber={appState.currentAyahNumber}
        currentHizbQuarter={currentAyah?.hizbQuarter}
        settings={settings}
        onUpdateTarget={handleUpdateTargetFromForecast}
      />

      <SurahJumpModal
        isOpen={isJumpOpen}
        onClose={() => setIsJumpOpen(false)}
        language={settings.language}
        onJumpTo={handleJumpTo}
      />

      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        target={settings.dailyTarget}
        targetMultiplier={settings.targetRubHizb}
        currentAyahNumber={appState.currentAyahNumber}
        currentHizbQuarter={currentAyah?.hizbQuarter}
        streak={appState.streak}
        language={settings.language}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        userMobile={mobileProfile?.mobileNumber}
        onLoginWithMobile={handleLoginWithMobile}
        onSignOut={handleSignOut}
        language={settings.language}
      />

      <LaterModal
        isOpen={isLaterOpen}
        onClose={() => setIsLaterOpen(false)}
        currentAyah={currentAyah}
        language={settings.language}
      />
    </div>
  );
}
