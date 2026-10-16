import React, { useState, useMemo } from 'react';
import { X, Search, Compass, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { SURAHS, getGlobalAyahNumber } from '../data/surahs';
import { AppLanguage } from '../types';
import { formatSurahName, useTranslation, toArabicDigits } from '../utils/translations';

interface SurahJumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onJumpTo: (globalAyahNumber: number) => void;
}

export const SurahJumpModal: React.FC<SurahJumpModalProps> = ({
  isOpen,
  onClose,
  language,
  onJumpTo,
}) => {
  if (!isOpen) return null;

  const t = useTranslation(language);
  const [search, setSearch] = useState('');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);

  const filteredSurahs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SURAHS;
    return SURAHS.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        String(s.number) === q
    );
  }, [search]);

  const activeSurah = SURAHS.find((s) => s.number === selectedSurahNumber);

  const handleConfirmJump = (surahNum: number, ayahNum: number) => {
    const globalNumber = getGlobalAyahNumber(surahNum, ayahNum);
    onJumpTo(globalNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {t('surahIndexTitle')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('surahIndexSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Surah selected for Ayah picking */}
        {activeSurah ? (
          <div className="p-5 sm:p-6 flex flex-col flex-1 overflow-hidden">
            <button
              onClick={() => setSelectedSurahNumber(null)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-4"
            >
              {language === 'ar' ? (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>العودة لكل السور</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to All Surahs</span>
                </>
              )}
            </button>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  {formatSurahName(activeSurah.name, language)}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {language === 'ar'
                    ? `${toArabicDigits(activeSurah.numberOfAyahs)} آية • ${activeSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`
                    : `${activeSurah.numberOfAyahs} Verses • ${activeSurah.revelationType}`}
                </p>
              </div>
            </div>

            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 block">
              {t('selectAyah')} ({language === 'ar' ? `١ إلى ${toArabicDigits(activeSurah.numberOfAyahs)}` : `1 to ${activeSurah.numberOfAyahs}`}):
            </label>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 overflow-y-auto max-h-[300px] p-1">
              {Array.from({ length: activeSurah.numberOfAyahs }, (_, i) => i + 1).map((ayahNum) => (
                <button
                  key={ayahNum}
                  onClick={() => handleConfirmJump(activeSurah.number, ayahNum)}
                  className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-emerald-500 bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-800 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold transition-all font-mono"
                >
                  {language === 'ar' ? toArabicDigits(ayahNum) : ayahNum}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800">
              <div className="relative">
                <Search className={`w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={t('searchSurahPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-emerald-500 text-start ${
                    language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                />
              </div>
            </div>

            {/* Surah List */}
            <div className="overflow-y-auto flex-1 p-2 divide-y divide-stone-100 dark:divide-stone-800/60">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => setSelectedSurahNumber(surah.number)}
                  className="px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/70 rounded-xl cursor-pointer flex items-center justify-between transition-colors group text-start"
                >
                  <div className="text-start">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {formatSurahName(surah.name, language)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {surah.englishName} • {language === 'ar' ? `${toArabicDigits(surah.numberOfAyahs)} آية` : `${surah.numberOfAyahs} Verses`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {language === 'ar' ? (
                      <ArrowLeft className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-emerald-500 transition-colors" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-emerald-500 transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
