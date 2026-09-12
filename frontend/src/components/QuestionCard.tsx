'use client';

import React from 'react';
import { Question } from '../lib/types';

interface QuestionCardProps {
  question: Question;
  index: number;
  value: string;
  onChange: (value: string) => void;
  isReviewed?: boolean;
  onToggleReview?: () => void;
  isActive?: boolean;
}

export default function QuestionCard({
  question,
  index,
  value,
  onChange,
  isReviewed = false,
  onToggleReview,
  isActive = false,
}: QuestionCardProps) {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 p-5 sm:p-6 bg-white border ${
        isActive
          ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
          : 'border-slate-200/90 shadow-xs hover:border-slate-300'
      }`}
    >
      {/* Savol sarlavhasi va Review tegi */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-lg border border-blue-100 uppercase tracking-wider">
            Savol #{index}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            {question.question_type === 'multiple_choice'
              ? 'Multiple Choice'
              : question.question_type === 'true_false'
              ? 'True / False / Not Given'
              : 'Fill in the Blank'}
          </span>
        </div>

        {onToggleReview && (
          <button
            type="button"
            onClick={onToggleReview}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isReviewed
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
            }`}
            title="Savolga qaytish uchun belgilash (Review)"
          >
            <svg className={`w-3.5 h-3.5 ${isReviewed ? 'text-amber-600 fill-amber-600' : 'text-slate-400 stroke-current'}`} viewBox="0 0 24 24" fill={isReviewed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            <span>{isReviewed ? 'Review qilingan' : 'Review'}</span>
          </button>
        )}
      </div>

      {/* Savol matni */}
      <div className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed mb-5">
        {question.question_text}
      </div>

      {/* 1. MULTIPLE CHOICE VARIANTLARI */}
      {question.question_type === 'multiple_choice' && question.options && (
        <div className="space-y-2.5">
          {question.options.map((opt, i) => {
            const optionLetter = String.fromCharCode(65 + i); // 'A', 'B', 'C', 'D'
            const isSelected = value === opt;

            return (
              <label
                key={i}
                className={`relative group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3.5 flex-1 pr-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span
                    className={`text-sm sm:text-base leading-snug ${
                      isSelected ? 'text-blue-950 font-bold' : 'text-slate-800 font-medium'
                    }`}
                  >
                    {opt}
                  </span>
                </div>

                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  className="hidden"
                />

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-slate-300 group-hover:border-slate-400 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* 2. TRUE / FALSE / NOT GIVEN VARIANTLARI */}
      {question.question_type === 'true_false' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {['True', 'False', 'Not Given'].map((opt) => {
            const isSelected = value === opt;
            const letter = opt === 'True' ? 'T' : opt === 'False' ? 'F' : 'NG';

            return (
              <label
                key={opt}
                className={`relative group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700'
                    }`}
                  >
                    {letter}
                  </span>
                  <span
                    className={`text-sm sm:text-base ${
                      isSelected ? 'text-blue-950 font-bold' : 'text-slate-800 font-medium'
                    }`}
                  >
                    {opt}
                  </span>
                </div>

                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  className="hidden"
                />

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-slate-300 group-hover:border-slate-400 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* 3. FILL IN THE BLANK (BO'SH O'RINGA YOZISH) */}
      {question.question_type === 'fill_blank' && (
        <div className="relative max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:bg-blue-50/10 focus:outline-none transition text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
            placeholder="Javobingizni shu yerga yozing..."
          />
        </div>
      )}
    </div>
  );
}
