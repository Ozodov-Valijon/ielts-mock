'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Timer from '../../../components/Timer';
import QuestionCard from '../../../components/QuestionCard';
import { api } from '../../../lib/api';
import { Question } from '../../../lib/types';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function ReadingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = Number(params.testId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setQuestions([
        { id: 101, section: 'reading', question_type: 'multiple_choice', question_text: 'What is the main idea of the passage?', passage_text: 'This is a long passage about history. It has many details...', options: ['History is old', 'History is important', 'History repeats'], order_num: 1 },
        { id: 102, section: 'reading', question_type: 'true_false', question_text: 'The passage says history repeats itself.', passage_text: 'This is a long passage about history. It has many details...', order_num: 2 },
        { id: 103, section: 'reading', question_type: 'fill_blank', question_text: 'Fill in the blank: History is ______', passage_text: 'This is a long passage about history. It has many details...', order_num: 3 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // await api.submitReadingAnswers(testId, answers);
      alert('Natijalar yuborildi!');
      router.push(`/test/${testId}/listening`);
    } catch (error) {
      console.error(error);
      alert('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Side: Passage */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto p-6">
          <h2 className="text-xl font-bold mb-4">Reading Passage 1</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {questions[0]?.passage_text}
          </div>
        </div>

        {/* Right Side: Questions */}
        <div className="w-full md:w-1/2 flex flex-col h-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">Savollar</h2>
            <Timer durationMinutes={60} onTimeUp={handleSubmit} />
          </div>

          <div className="flex-1 bg-gray-50 rounded-lg overflow-y-auto p-2">
            {questions.map((q, idx) => (
              <QuestionCard 
                key={q.id} 
                question={q} 
                index={idx + 1} 
                value={answers[q.id] || ''} 
                onChange={(val) => handleAnswerChange(q.id, val)} 
              />
            ))}
            
            <div className="mt-8 mb-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50"
              >
                {submitting ? 'Yuborilmoqda...' : 'Yuborish (Submit)'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}
