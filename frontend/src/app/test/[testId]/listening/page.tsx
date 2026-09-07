'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Timer from '../../../components/Timer';
import QuestionCard from '../../../components/QuestionCard';
import AudioPlayer from '../../../components/AudioPlayer';
import { Question } from '../../../lib/types';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function ListeningTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = Number(params.testId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    setTimeout(() => {
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Mock audio
      setQuestions([
        { id: 201, section: 'listening', question_type: 'multiple_choice', question_text: 'What is the speaker discussing?', options: ['Travel', 'Music', 'History'], order_num: 1 },
        { id: 202, section: 'listening', question_type: 'fill_blank', question_text: 'The event starts at ______.', order_num: 2 }
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
      // await api.submitListeningAnswers(testId, answers);
      alert('Listening natijalari yuborildi!');
      router.push(`/test/${testId}/writing`);
    } catch (error) {
      alert('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold mb-2">Listening Test</h2>
            {audioUrl && <AudioPlayer src={audioUrl} allowReplay={false} />}
          </div>
          <div className="w-full md:w-auto">
            <Timer durationMinutes={30} onTimeUp={handleSubmit} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Savollar</h3>
          {questions.map((q, idx) => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              index={idx + 1} 
              value={answers[q.id] || ''} 
              onChange={(val) => handleAnswerChange(q.id, val)} 
            />
          ))}
          
          <div className="mt-8 flex justify-end">
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
    </ProtectedRoute>
  );
}
