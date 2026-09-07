'use client';

import React from 'react';
import { Question } from '../lib/types';

interface QuestionCardProps {
  question: Question;
  index: number;
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionCard({ question, index, value, onChange }: QuestionCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex space-x-3">
        <span className="font-bold text-lg text-blue-800">{index}.</span>
        <div className="flex-1">
          <p className="text-gray-800 text-lg mb-4">{question.question_text}</p>
          
          {question.question_type === 'multiple_choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((opt, i) => (
                <label key={i} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {question.question_type === 'true_false' && (
            <div className="space-y-3">
              {['True', 'False', 'Not Given'].map((opt) => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {question.question_type === 'fill_blank' && (
            <div>
              <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Javobni kiriting..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
