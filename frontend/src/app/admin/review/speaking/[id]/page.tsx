'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import AudioPlayer from '../../../../components/AudioPlayer';
import { useRouter } from 'next/navigation';

export default function AdminReviewSpeakingDetail() {
  const router = useRouter();
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  const handleApprove = () => {
    alert('Muvaffaqiyatli saqlandi!');
    router.push('/admin/review');
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Speaking Tekshiruvi</h1>
          <button onClick={() => router.push('/admin/review')} className="text-gray-500 hover:text-gray-800 font-medium">Orqaga qaytish</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Talaba Audiosi</h2>
          <AudioPlayer src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" allowReplay={true} />
          
          <div className="mt-6">
            <h3 className="font-bold text-gray-700 mb-2">Avtomatik Transkript (AI)</h3>
            <div className="bg-gray-50 p-4 rounded border border-gray-100 text-gray-600 italic">
              "Yes, my hometown is quite small and quiet. I like the peaceful atmosphere and the friendly people..."
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 mb-6">
          <h2 className="text-xl font-bold mb-2 text-blue-900">AI Tahlili (Tahminiy)</h2>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-extrabold text-blue-600">6.5</div>
            <p className="text-blue-800 text-sm">
              Fluency: 6.0 | Pronunciation: 7.0 | Lexical Resource: 6.5 | Grammar: 6.5
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 text-green-800">O'qituvchi Bahosi</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Talabaga maslahatlaringizni yozing..."
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">Yakuniy Ball (Band Score)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="9"
              value={score}
              onChange={(e) => setScore(Number(e.target.value) || '')}
              className="w-32 text-2xl font-bold p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-center"
            />
          </div>

          <button
            onClick={handleApprove}
            disabled={!score}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            Tasdiqlash
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
