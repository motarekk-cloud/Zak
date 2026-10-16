import React from 'react';
import { BookOpen, Flame, Settings, Compass, Moon, Sun, Calendar, Smartphone } from 'lucide-react';
import { UserSettings } from '../types';
import { useTranslation, toArabicDigits } from '../utils/translations';

interface HeaderProps {
  streak: number;
  settings: UserSettings;
  userMobile?: string | null;
  onOpenSettings: () => void;
  onOpenJump: () => void;
  onOpenForecast?: () => void;
  onOpenAuth?: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  settings,
  userMobile,
  onOpenSettings,
  onOpenJump,
  onOpenForecast,
  onOpenAuth,
  onToggleTheme,
}) => {
  const t = useTranslation(settings.language);

  const streakDisplay =
    settings.language === 'ar'
      ? `${toArabicDigits(streak)} ${t('streakDays')}`
      : `${streak} ${t('streakDays')}`;

  return (
    <header className="w-full bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-xs shadow-emerald-600/30">
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 tracking-tight font-serif">
                {t('appName')}
              </h1>
              <span className="hidden xs:inline-block text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                {t('quranMushafTag')}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Right: Controls, Streak & Mobile Sync */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Daily Streak */}
          <div
            title={`${streak} days reading streak`}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streakDisplay}</span>
          </div>

          {/* User Mobile Login / Sync Button */}
          {onOpenAuth && (
            <button
              id="user-auth-btn"
              onClick={onOpenAuth}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-all border ${
                userMobile
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
              title={userMobile ? `${t('synced')}: ${userMobile}` : t('sync')}
            >
              <Smartphone className={`w-3.5 h-3.5 ${userMobile ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`} />
              <span className="hidden md:inline">{userMobile ? t('synced') : t('sync')}</span>
            </button>
          )}

          {/* Khatmah Simulation Button */}
          {onOpenForecast && (
            <button
              id="khatmah-forecast-btn"
              onClick={onOpenForecast}
              className="p-1.5 sm:px-2 sm:py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-all flex items-center gap-1"
              title={t('khatmahForecast')}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">{t('khatmah')}</span>
            </button>
          )}

          {/* Jump to Surah / Ayah */}
          <button
            id="jump-surah-btn"
            onClick={onOpenJump}
            className="p-1.5 sm:px-2 sm:py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-all flex items-center gap-1"
            title={t('index')}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline">{t('index')}</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            title={settings.theme === 'dark' ? t('themeLight') : t('themeDark')}
            aria-label={settings.theme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-in fade-in zoom-in" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-stone-600 animate-in fade-in zoom-in" />
            )}
          </button>

          {/* Settings Button */}
          <button
            id="settings-btn"
            onClick={onOpenSettings}
            className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-colors"
            title={t('settings')}
            aria-label={t('settings')}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
