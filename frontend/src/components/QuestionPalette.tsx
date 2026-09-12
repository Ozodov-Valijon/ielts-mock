'use client';

import React from 'react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answeredIndices: Set<number>;
  reviewIndices: Set<number>;
  onSelect: (index: number) => void;
  onToggleReview: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function QuestionPalette({
  totalQuestions,
  currentIndex,
  answeredIndices,
  reviewIndices,
  onSelect,
  onToggleReview,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting = false,
}: QuestionPaletteProps) {
  const isCurrentReviewed = reviewIndices.has(currentIndex);

  return (
    <nav aria-label="Savollar navigatsiyasi" className="bg-[#f3f4f6] border-t border-gray-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none text-sm shadow-inner">
      {/* Chap tomon: Review katakchasi va Part ma'lumoti */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer text-gray-700 font-semibold hover:text-gray-900 transition">
          <input
            type="checkbox"
            checked={isCurrentReviewed}
            onChange={() => onToggleReview(currentIndex)}
            className="w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500 border-gray-400"
          />
          <span className="flex items-center space-x-1.5">
            <svg className={`w-3.5 h-3.5 ${isCurrentReviewed ? 'text-amber-500 fill-amber-500' : 'text-gray-400 stroke-current'}`} viewBox="0 0 24 24" fill={isCurrentReviewed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            <span>Review</span>
          </span>
        </label>

        <div className="hidden md:flex items-center space-x-2 text-xs text-gray-500 font-medium">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-700"></span>
          <span>Javob berilgan ({answeredIndices.size}/{totalQuestions})</span>
        </div>
      </div>

      {/* O'rta: 1 dan 40 gacha savollar navigatsiya lentasi */}
      <div className="flex-1 overflow-x-auto py-1 px-2 flex items-center space-x-1.5 scrollbar-thin scrollbar-thumb-gray-400 max-w-2xl">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isAnswered = answeredIndices.has(i);
          const isReviewed = reviewIndices.has(i);
          const isActive = currentIndex === i;

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`relative min-w-[34px] h-[34px] text-xs font-bold rounded flex items-center justify-center transition-all ${
                isActive
                  ? 'ring-2 ring-blue-600 ring-offset-1 z-10 shadow-sm'
                  : ''
              } ${
                isAnswered
                  ? 'bg-blue-800 text-white hover:bg-blue-900'
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
              }`}
              title={`Savol #${i + 1}${isAnswered ? ' (Javob berilgan)' : ''}${isReviewed ? ' (Review qilingan)' : ''}`}
            >
              <span>{i + 1}</span>

              {/* Review qilinganlik belgisi (sariq nuqta) */}
              {isReviewed && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-amber-600 shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* O'ng tomon: Oldingi, Keyingi va Yakunlash tugmalari */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-3 py-1.5 rounded bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span className="hidden sm:inline">Back</span>
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={onNext}
            className="px-3.5 py-1.5 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 transition flex items-center space-x-1"
          >
            <span className="hidden sm:inline">Next</span>
            <span>&rarr;</span>
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white font-bold transition shadow-xs flex items-center space-x-1 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Tekshirilmoqda...</span>
            ) : (
              <span>Submit</span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}
