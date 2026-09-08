'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Timer from '@/components/Timer';
import QuestionCard from '@/components/QuestionCard';
import AudioPlayer from '@/components/AudioPlayer';
import { api } from '@/lib/api';
import { Question } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ListeningTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = String(params.testId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [resultScore, setResultScore] = useState<number | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await api.getListeningQuestions(testId);
        setQuestions(data);
        if (data && data.length > 0 && data[0].audio_url) {
          setAudioUrl(data[0].audio_url);
        } else {
          setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        }
      } catch (err: any) {
        console.error("Listening savollarini yuklashda xatolik:", err);
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
      const res = await api.submitListeningAnswers(testId, payload);
      setResultScore(res.score);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    router.push(`/test/${testId}/writing`);
  };

  if (loading) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Listening Section 1
              </span>
              <span className="text-xs text-gray-500">Audio 1 marta ijro etiladi</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Listening Audio</h2>
            {audioUrl && <AudioPlayer src={audioUrl} allowReplay={false} />}
          </div>
          {resultScore === null && (
            <div className="w-full md:w-auto self-start md:self-center">
              <Timer durationMinutes={30} onTimeUp={handleSubmit} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {resultScore !== null ? (
            <div className="p-8 text-center my-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Listening Yakunlandi!</h3>
              <p className="text-gray-600 mb-4">Sizning Listening bo'limi bo'yicha bahongiz:</p>
              <div className="text-6xl font-black text-blue-700 mb-6">{resultScore.toFixed(1)}</div>
              <button
                onClick={handleProceed}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow transition transform hover:scale-105"
              >
                Keyingi: Writing Bo'limiga O'tish →
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-800">Savollar (1 - {questions.length})</h3>
                <span className="text-xs text-gray-500 font-medium">Audioni tinglab, javoblarni belgilang</span>
              </div>
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
              
              <div className="mt-8 flex justify-end">
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
    </ProtectedRoute>
  );
}
