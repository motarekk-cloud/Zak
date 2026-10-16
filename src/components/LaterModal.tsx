import React from 'react';
import { Clock, X, BookOpen } from 'lucide-react';
import { Ayah, AppLanguage } from '../types';
import { formatSurahName, useTranslation, toArabicDigits } from '../utils/translations';

interface LaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAyah: Ayah | null;
  language: AppLanguage;
}

export const LaterModal: React.FC<LaterModalProps> = ({
  isOpen,
  onClose,
  currentAyah,
  language,
}) => {
  const t = useTranslation(language);
  if (!isOpen || !currentAyah) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 text-stone-900 dark:text-stone-100">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{t('laterModalTitle')}</h2>
              <p className="text-[11px] text-stone-400">
                {language === 'ar' ? 'حفظ التقدم واستئناف القراءة لاحقاً' : 'Saved position to resume anytime'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-center py-1">
          {/* Card detailing saved ayah */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-start sm:text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'ar'
                  ? `${formatSurahName(currentAyah.surah.name)} • الآية ${toArabicDigits(currentAyah.numberInSurah)}`
                  : `Surah ${currentAyah.surah.englishName} • Verse ${currentAyah.numberInSurah}`}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {language === 'ar'
                ? `الجزء ${toArabicDigits(currentAyah.juz)} • الحزب ${toArabicDigits(currentAyah.hizbQuarter ? Math.ceil(currentAyah.hizbQuarter / 4) : 1)}`
                : `Juz ${currentAyah.juz} • Hizb ${(currentAyah.hizbQuarter ? Math.ceil(currentAyah.hizbQuarter / 4) : 1)}`}
            </p>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed px-1">
            {t('laterModalDesc')}
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all"
            >
              {t('laterClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
