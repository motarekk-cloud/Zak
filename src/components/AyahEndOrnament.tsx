import React from 'react';
import { toArabicDigits } from '../utils/translations';
import { AppLanguage } from '../types';

interface AyahEndOrnamentProps {
  numberInSurah: number;
  language?: AppLanguage;
}

export const AyahEndOrnament: React.FC<AyahEndOrnamentProps> = ({
  numberInSurah,
  language = 'ar',
}) => {
  const displayNum = language === 'ar' ? toArabicDigits(numberInSurah) : String(numberInSurah);

  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-1.5 sm:mx-2 select-none"
      title={`الآية ${numberInSurah}`}
      aria-label={`الآية ${numberInSurah}`}
    >
      <span className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
        {/* Authentic Islamic Rosette End-of-Ayah Medallion */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-2xs text-emerald-700 dark:text-emerald-400 fill-amber-50 dark:fill-stone-900"
          aria-hidden="true"
        >
          {/* Outer 8-pointed star / scallop petals */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray="4 2"
          />
          {/* Inner ring */}
          <circle
            cx="50"
            cy="50"
            r="37"
            stroke="#d97706"
            strokeWidth="2"
            fill="none"
            opacity="0.85"
          />
          {/* Decorative 8 petal dots */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + 44 * Math.cos(rad);
            const cy = 50 + 44 * Math.sin(rad);
            return (
              <circle
                key={angle}
                cx={cx}
                cy={cy}
                r="3"
                className="fill-amber-600 dark:fill-amber-400"
              />
            );
          })}
          {/* Solid central circle for number background */}
          <circle
            cx="50"
            cy="50"
            r="32"
            className="fill-white dark:fill-stone-900 stroke-emerald-700 dark:stroke-emerald-500"
            strokeWidth="2.5"
          />
        </svg>

        {/* Center Ayah Number */}
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-stone-900 dark:text-emerald-300 font-serif"
          style={{
            fontSize: numberInSurah > 99 ? '11px' : numberInSurah > 9 ? '12.5px' : '14px',
            lineHeight: 1,
            paddingTop: language === 'ar' ? '1px' : '0px',
          }}
        >
          {displayNum}
        </span>
      </span>
    </span>
  );
};
