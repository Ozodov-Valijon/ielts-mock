'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import Timer from '@/components/Timer';
import QuestionCard from '@/components/QuestionCard';
import { api } from '@/lib/api';
import { Question } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ReadingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = String(params.testId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultScore, setResultScore] = useState<number | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await api.getReadingQuestions(testId);
        setQuestions(data);
      } catch (err: any) {
        console.error("Savollarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [testId]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = questions.map(q => ({
        question_id: q.id,
        user_answer: answers[q.id] || ''
      }));
      const res = await api.submitReadingAnswers(testId, payload);
      setResultScore(res.score);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    router.push(`/test/${testId}/listening`);
  };

  if (loading) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 min-h-[calc(100vh-140px)] p-4">
        
        {/* Chap tomon: Passage */}
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-6 md:p-8 max-h-[85vh]">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Reading Section 1
            </span>
            <span className="text-xs text-gray-500 font-medium">Jami {questions.length} ta savol</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">Reading Passage</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed font-serif text-base whitespace-pre-wrap">
            {questions[0]?.passage_text || "Matn yuklanmoqda..."}
          </div>
        </div>

        {/* O'ng tomon: Savollar */}
        <div className="w-full md:w-1/2 flex flex-col max-h-[85vh]">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Savollar (1 - {questions.length})</h2>
              <p className="text-xs text-gray-500">Barcha savollarga javob bering</p>
            </div>
            {resultScore === null && (
              <Timer durationMinutes={60} onTimeUp={handleSubmit} />
            )}
          </div>

          <div className="flex-1 bg-gray-50 rounded-xl overflow-y-auto p-4 border border-gray-200">
            {resultScore !== null ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-green-200 text-center my-auto">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Reading Yakunlandi!</h3>
                <p className="text-gray-600 mb-4">Sizning Reading bo&apos;limi bo&apos;yicha bahongiz:</p>
                <div className="text-6xl font-black text-blue-700 mb-6">{resultScore.toFixed(1)}</div>
                <button
                  onClick={handleProceed}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow transition transform hover:scale-105"
                >
                  Keyingi: Listening Bo&apos;limiga O&apos;tish →
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <QuestionCard 
                      key={q.id} 
                      question={q} 
                      index={idx + 1} 
                      value={answers[q.id] || ''} 
                      onChange={(val) => handleAnswerChange(q.id, val)} 
                    />
                  ))}
                </div>
                
                <div className="mt-8 mb-4 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition shadow disabled:opacity-50"
                  >
                    {submitting ? 'Yuborilmoqda...' : 'Javoblarni Yuborish (Submit)'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
