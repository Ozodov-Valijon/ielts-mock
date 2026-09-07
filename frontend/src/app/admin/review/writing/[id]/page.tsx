'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function AdminReviewWritingDetail() {
  const router = useRouter();
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  
  // Mock data
  const studentText = "Nowadays, many people believe that technology is making us less social. I agree with this to some extent because people spend too much time on their phones instead of talking to each other face to face...";
  const aiAnalysis = {
    TaskResponse: 6.5,
    CoherenceCohesion: 6.0,
    LexicalResource: 7.0,
    GrammaticalRange: 6.5,
    Overall: 6.5
  };

  const handleApprove = () => {
    alert('Muvaffaqiyatli saqlandi!');
    router.push('/admin/review');
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Writing Tekshiruvi</h1>
          <button onClick={() => router.push('/admin/review')} className="text-gray-500 hover:text-gray-800 font-medium">Orqaga qaytish</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Student Text */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Talaba Matni</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap font-serif leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200 h-96 overflow-y-auto">
              {studentText}
            </div>
            <div className="mt-4 text-sm text-gray-500 font-medium">
              Word count: 32
            </div>
          </div>

          {/* Right Column: AI Analysis & Admin Form */}
          <div className="flex flex-col gap-6">
            <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-900 border-b border-blue-200 pb-2 flex items-center justify-between">
                <span>AI Tahlili</span>
                <span className="text-2xl font-extrabold text-blue-600">{aiAnalysis.Overall}</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500 font-bold uppercase">Task Response</div>
                  <div className="text-xl font-bold">{aiAnalysis.TaskResponse}</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500 font-bold uppercase">Coherence</div>
                  <div className="text-xl font-bold">{aiAnalysis.CoherenceCohesion}</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500 font-bold uppercase">Lexical Resource</div>
                  <div className="text-xl font-bold">{aiAnalysis.LexicalResource}</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500 font-bold uppercase">Grammar</div>
                  <div className="text-xl font-bold">{aiAnalysis.GrammaticalRange}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1">
              <h2 className="text-xl font-bold mb-4 border-b pb-2 text-green-800">O'qituvchi Bahosi</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Feedback (Tavsiyalar)</label>
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
