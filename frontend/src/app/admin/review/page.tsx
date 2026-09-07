'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Link from 'next/link';

export default function AdminReviewPage() {
  const [tab, setTab] = useState<'writing' | 'speaking'>('writing');

  // Mock data
  const writingReviews = [
    { id: 101, student_name: 'Ali Valiyev', date: '2026-09-07', task: 'Task 2' },
    { id: 102, student_name: 'Zarina Gofurova', date: '2026-09-06', task: 'Task 1' },
  ];

  const speakingReviews = [
    { id: 201, student_name: 'Ali Valiyev', date: '2026-09-07', part: 'Parts 1, 2, 3' },
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Tekshirish Navbati</h1>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button 
              className={`flex-1 py-4 text-center font-bold ${tab === 'writing' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setTab('writing')}
            >
              Writing ({writingReviews.length})
            </button>
            <button 
              className={`flex-1 py-4 text-center font-bold ${tab === 'speaking' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setTab('speaking')}
            >
              Speaking ({speakingReviews.length})
            </button>
          </div>

          <div className="p-0">
            {tab === 'writing' && (
              <ul className="divide-y divide-gray-100">
                {writingReviews.map(r => (
                  <li key={r.id}>
                    <Link href={`/admin/review/writing/${r.id}`} className="flex items-center justify-between p-6 hover:bg-gray-50 transition">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{r.student_name}</h3>
                        <p className="text-gray-500">{r.date} &bull; <span className="font-medium">{r.task}</span></p>
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
                        Tekshirish
                      </div>
                    </Link>
                  </li>
                ))}
                {writingReviews.length === 0 && <li className="p-8 text-center text-gray-500">Barcha writing testlar tekshirilgan.</li>}
              </ul>
            )}
            
            {tab === 'speaking' && (
              <ul className="divide-y divide-gray-100">
                {speakingReviews.map(r => (
                  <li key={r.id}>
                    <Link href={`/admin/review/speaking/${r.id}`} className="flex items-center justify-between p-6 hover:bg-gray-50 transition">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{r.student_name}</h3>
                        <p className="text-gray-500">{r.date} &bull; <span className="font-medium">{r.part}</span></p>
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
                        Tekshirish
                      </div>
                    </Link>
                  </li>
                ))}
                {speakingReviews.length === 0 && <li className="p-8 text-center text-gray-500">Barcha speaking testlar tekshirilgan.</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
