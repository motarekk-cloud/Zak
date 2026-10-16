import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, CheckCircle2, Flame, ArrowRight, Calendar } from 'lucide-react';
import { getRubHizbDescription, simulateKhatmah, formatReadingDuration } from '../utils/khatmahSimulation';
import { AppLanguage } from '../types';
import { useTranslation, toArabicDigits } from '../utils/translations';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: number;
  targetMultiplier?: number;
  currentAyahNumber?: number;
  currentHizbQuarter?: number;
  streak: number;
  language: AppLanguage;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  target,
  targetMultiplier = 1,
  currentAyahNumber = 1,
  currentHizbQuarter,
  streak,
  language,
}) => {
  const t = useTranslation(language);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#fbbf24'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetDesc = getRubHizbDescription(targetMultiplier);
  const simulation = simulateKhatmah({
    currentAyahNumber,
    targetRubHizb: targetMultiplier,
    hizbQuarter: currentHizbQuarter,
    language,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 text-center flex flex-col items-center">
        {/* Animated Badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 animate-bounce">
          <Award className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 mb-2">
          {language === 'ar' ? 'ما شاء الله تبارك الله' : 'Masha’Allah'}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          {language === 'ar' ? 'أتممت وردك اليومي بنجاح!' : 'Daily Target Achieved!'}
        </h2>

        <p className="text-sm text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
          {language === 'ar'
            ? `أتممت ورد اليوم بمقدار ${targetDesc.arabic} (${formatReadingDuration(simulation.estimatedDailyMinutes, 'ar')}) تقبّل الله منك طاعتك.`
            : `You completed your target of ${targetDesc.english} (${formatReadingDuration(simulation.estimatedDailyMinutes, 'en')}) today.`}
        </p>

        {/* Khatmah Simulation Card in Celebration */}
        <div className="w-full p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 mb-4 text-start">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('expectedKhatmahDate')}</span>
          </div>
          <div className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
            {simulation.expectedCompletionFormatted}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
            {simulation.relativeTimeText}
          </div>
        </div>

        {/* Streak Highlight */}
        <div className="w-full p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 mb-6 flex items-center justify-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="text-start">
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              {language === 'ar'
                ? `تتابع قرآني لـ ${toArabicDigits(streak)} أيام متتالية!`
                : `${streak}-Day Continuous Reading Streak!`}
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400">
              {language === 'ar' ? 'أحب الأعمال إلى الله أدومها وإن قل' : 'Consistency is the key to spiritual growth'}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{language === 'ar' ? 'متابعة قراءة المزيد' : 'Continue Reading More'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
