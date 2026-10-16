import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, AlertCircle, LogIn, Lock, Award, Flame, BookOpen } from 'lucide-react';
import { MobileUserProfile, AppLanguage } from '../types';
import { useTranslation, toArabicDigits } from '../utils/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  currentMobileNumber: string | null;
  activeProfile: MobileUserProfile | null;
  onLoginWithMobile: (mobileNumber: string, pin?: string) => Promise<void>;
  onSignOut: () => void;
}

const COUNTRY_CODES = [
  { code: '+966', countryAr: 'السعودية', countryEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+20', countryAr: 'مصر', countryEn: 'Egypt', flag: '🇪🇬' },
  { code: '+971', countryAr: 'الإمارات', countryEn: 'UAE', flag: '🇦🇪' },
  { code: '+965', countryAr: 'الكويت', countryEn: 'Kuwait', flag: '🇰🇼' },
  { code: '+974', countryAr: 'قطر', countryEn: 'Qatar', flag: '🇶🇦' },
  { code: '+968', countryAr: 'عُمان', countryEn: 'Oman', flag: '🇴🇲' },
  { code: '+973', countryAr: 'البحرين', countryEn: 'Bahrain', flag: '🇧🇭' },
  { code: '+962', countryAr: 'الأردن', countryEn: 'Jordan', flag: '🇯🇴' },
  { code: '+964', countryAr: 'العراق', countryEn: 'Iraq', flag: '🇮🇶' },
  { code: '+970', countryAr: 'فلسطين', countryEn: 'Palestine', flag: '🇵🇸' },
  { code: '+212', countryAr: 'المغرب', countryEn: 'Morocco', flag: '🇲🇦' },
  { code: '+213', countryAr: 'الجزائر', countryEn: 'Algeria', flag: '🇩🇿' },
  { code: '+1', countryAr: 'أمريكا / كندا', countryEn: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', countryAr: 'المملكة المتحدة', countryEn: 'UK', flag: '🇬🇧' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  currentMobileNumber,
  activeProfile,
  onLoginWithMobile,
  onSignOut,
}) => {
  const t = useTranslation(language);
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.trim().replace(/^0+/, ''); // strip leading zero
    if (!cleanNumber || cleanNumber.length < 6) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال رقم جوال صحيح' : 'Please enter a valid mobile number');
      return;
    }

    const fullMobile = `${countryCode}${cleanNumber}`;
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await onLoginWithMobile(fullMobile, pin.trim());
      setStatusMessage(
        language === 'ar'
          ? 'تم تسجيل الدخول بنجاح ومزامنة إنجازاتك وموضع قراءتك!'
          : 'Successfully logged in! Progress and achievements synced.'
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || (language === 'ar' ? 'حدث خطأ أثناء المزامنة' : 'Error during sync'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{t('mobileAuthTitle')}</h2>
              <p className="text-[10px] text-stone-400">{t('mobileAuthSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If user is already logged in with mobile number */}
        {currentMobileNumber ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {t('currentlySyncedWith')}
              </div>
              <div dir="ltr" className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5 tracking-wider">
                {currentMobileNumber}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                {t('syncedSuccess')}
              </div>
            </div>

            {/* Achievements & Progress Summary */}
            {activeProfile && (
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {language === 'ar'
                        ? `الآية ${toArabicDigits(activeProfile.currentAyahNumber)}`
                        : `Ayah ${activeProfile.currentAyahNumber}`}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400">{language === 'ar' ? 'موضع الختمة' : 'Position'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    <span>
                      {language === 'ar'
                        ? `${toArabicDigits(activeProfile.streak)} أيام`
                        : `${activeProfile.streak} days`}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400">{language === 'ar' ? 'التتابع اليومي' : 'Streak'}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {language === 'ar'
                ? 'أدخل رقم جوالك لتثبيت موضع قراءتك ووردك اليومي واستعادتهما تلقائياً على أي جهاز كمبيوتر أو هاتف ذكي.'
                : 'Enter your mobile number to permanently sync your reading position and achievements across your devices.'}
            </p>

            {/* Mobile Number with Country Code */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                {t('mobileNumberLabel')}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="py-2 px-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 shrink-0"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code} ({language === 'ar' ? item.countryAr : item.countryEn})
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t('mobileNumberPlaceholder')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* PIN Code / Passcode (Optional security) */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                {t('pinLabel')}
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="password"
                  dir="ltr"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={t('pinPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Feedback messages */}
            {statusMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? (language === 'ar' ? 'جاري المزامنة...' : 'Syncing...') : t('loginOrRegisterBtn')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
