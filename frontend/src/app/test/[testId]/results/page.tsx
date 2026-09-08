'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScoreCard from '@/components/ScoreCard';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Feedback } from '@/lib/types';
import { api } from '@/lib/api';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = String(params.testId);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeedback() {
      try {
        setLoading(true);
        const data = await api.getFeedback(testId);
        setFeedback(data);
      } catch (err: any) {
        console.error("Natijalarni yuklashda xatolik:", err);
        setError(err.message || "Natijalarni hisoblashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [testId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Test ballaringiz hisoblanmoqda...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !feedback) {
    return (
      <ProtectedRoute>
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-red-200 text-center shadow-sm">
          <div className="text-red-500 text-5xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Natija Topilmadi</h2>
          <p className="text-gray-600 text-sm mb-6">{error || "Ushbu test bo'yicha ma'lumot mavjud emas."}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition"
          >
            Dashboard ga qaytish
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            IELTS Mock Test Sertifikati
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2">Sizning Test Natijalaringiz</h1>
          <p className="text-gray-600 text-sm mt-1">Mock Test #{testId} bo'yicha to'liq hisobot va tahlil</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-center">
          <div className="w-64 h-64 rounded-full border-8 border-blue-600 flex flex-col items-center justify-center shadow-2xl bg-white transform hover:scale-105 transition">
            <span className="text-gray-400 font-extrabold tracking-widest text-xs uppercase mb-1">Overall Band</span>
            <span className="text-7xl font-black text-blue-900 leading-none">{feedback.overall_band.toFixed(1)}</span>
            <span className="text-xs text-blue-600 font-bold mt-2">IELTS Scale (1 - 9)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1 w-full max-w-2xl">
            <ScoreCard title="Reading" score={feedback.reading_score} />
            <ScoreCard title="Listening" score={feedback.listening_score} />
            <ScoreCard title="Writing" score={feedback.writing_score} />
            <ScoreCard title="Speaking" score={feedback.speaking_score} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-2xl border border-green-200 shadow-sm">
            <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💪</span> Kuchli Tomonlar
            </h3>
            <div className="text-green-950 text-sm leading-relaxed whitespace-pre-line font-medium">
              {feedback.strengths || "Yaxshi natija ko'rsatildi."}
            </div>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
            <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">⚠️</span> E'tibor Qaratish Kerak
            </h3>
            <div className="text-orange-950 text-sm leading-relaxed whitespace-pre-line font-medium">
              {feedback.weaknesses || "Katta kamchiliklar kuzatilmadi."}
            </div>
          </div>
        </div>

        {feedback.recommendations && (
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 mb-10 shadow-sm">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💡</span> Mentor va AI Tavsiyalari
            </h3>
            <div className="text-blue-950 text-sm leading-relaxed whitespace-pre-line font-medium">
              {feedback.recommendations}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-xl font-bold text-base transition shadow-xl transform hover:scale-105"
          >
            Dashboard ga Qaytish
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
