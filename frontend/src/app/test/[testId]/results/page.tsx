'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import ScoreCard from '../../../components/ScoreCard';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Feedback } from '../../../lib/types';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = Number(params.testId);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API
    setTimeout(() => {
      setFeedback({
        id: 1,
        test_id: testId,
        reading_score: 7.5,
        listening_score: 8.0,
        writing_score: 6.5,
        speaking_score: 7.0,
        overall_band: 7.5,
        strengths: "Vocabulary is varied and accurate. Good understanding of main ideas in listening.",
        weaknesses: "Grammatical accuracy in writing task 2 needs improvement. Fluency drops when discussing complex topics.",
        recommendations: "Practice more complex sentence structures. Focus on time management in writing."
      });
      setLoading(false);
    }, 1500);
  }, [testId]);

  if (loading) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;
  if (!feedback) return <ProtectedRoute><div className="text-center mt-20">Natija topilmadi</div></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">Test Natijalari</h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-center">
          <div className="w-64 h-64 rounded-full border-8 border-blue-500 flex flex-col items-center justify-center shadow-xl bg-white">
            <span className="text-gray-500 font-bold tracking-widest mb-2 uppercase">Overall Band</span>
            <span className="text-7xl font-extrabold text-blue-900">{feedback.overall_band.toFixed(1)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1 w-full max-w-2xl">
            <ScoreCard title="Reading" score={feedback.reading_score} />
            <ScoreCard title="Listening" score={feedback.listening_score} />
            <ScoreCard title="Writing" score={feedback.writing_score} />
            <ScoreCard title="Speaking" score={feedback.speaking_score} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center"><span className="text-2xl mr-2">💪</span> Kuchli tomonlar</h3>
            <p className="text-green-900 leading-relaxed">{feedback.strengths}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center"><span className="text-2xl mr-2">⚠️</span> Zaif tomonlar</h3>
            <p className="text-orange-900 leading-relaxed">{feedback.weaknesses}</p>
          </div>
        </div>

        {feedback.recommendations && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-10">
            <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center"><span className="text-2xl mr-2">💡</span> Tavsiyalar</h3>
            <p className="text-blue-900 leading-relaxed">{feedback.recommendations}</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-800 hover:bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-lg"
          >
            Dashboard ga qaytish
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
