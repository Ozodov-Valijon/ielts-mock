'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminReviewPage() {
  const [tab, setTab] = useState<'writing' | 'speaking'>('writing');
  const [loading, setLoading] = useState(true);
  const [writingPending, setWritingPending] = useState<any[]>([]);
  const [speakingPending, setSpeakingPending] = useState<any[]>([]);

  useEffect(() => {
    async function loadPending() {
      try {
        setLoading(true);
        const data = await api.adminGetPendingReviews();
        setWritingPending(data.writing_pending || []);
        setSpeakingPending(data.speaking_pending || []);
      } catch (err) {
        console.error("Navbatni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPending();
  }, []);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Admin Tekshiruv Navbati
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Tekshirish Kutilayotgan Javoblar</h1>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition"
          >
            ← Admin Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button 
                className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition ${tab === 'writing' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setTab('writing')}
              >
                Writing ({writingPending.length})
              </button>
              <button 
                className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition ${tab === 'speaking' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setTab('speaking')}
              >
                Speaking ({speakingPending.length})
              </button>
            </div>

            <div className="p-0">
              {tab === 'writing' && (
                <ul className="divide-y divide-gray-100">
                  {writingPending.map(r => (
                    <li key={r.id}>
                      <Link href={`/admin/review/writing/${r.id}`} className="flex items-center justify-between p-6 hover:bg-gray-50 transition">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-base">{r.student_name || `Test #${r.test_id}`}</span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                              Task {r.task_number}
                            </span>
                            {r.is_flagged_cheating ? (
                              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                ⚠️ Shubhali ({r.tab_switches} tab, {r.paste_attempts} paste)
                              </span>
                            ) : (
                              <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                                🛡️ Anti-cheat: Toza
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            Email: {r.student_email || '-'} &bull; AI Dastlabki Ball: <strong>{r.ai_score?.toFixed(1) || '6.0'}</strong> &bull; Status: <span className="text-orange-600 font-bold">{r.status}</span>
                          </p>
                        </div>
                        <div className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition">
                          Tekshirish →
                        </div>
                      </Link>
                    </li>
                  ))}
                  {writingPending.length === 0 && (
                    <li className="p-12 text-center text-gray-500 font-medium">
                      Barcha writing insholar tekshirilgan. Hozircha navbatda yangi insholar yo&apos;q.
                    </li>
                  )}
                </ul>
              )}
              
              {tab === 'speaking' && (
                <ul className="divide-y divide-gray-100">
                  {speakingPending.map(r => (
                    <li key={r.id}>
                      <Link href={`/admin/review/speaking/${r.id}`} className="flex items-center justify-between p-6 hover:bg-gray-50 transition">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-base">{r.student_name || `Test #${r.test_id}`}</span>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">
                              Part {r.part_number}
                            </span>
                            {r.is_flagged_cheating ? (
                              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                ⚠️ Shubhali ({r.tab_switches} tab almashtirish)
                              </span>
                            ) : (
                              <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                                🛡️ Anti-cheat: Toza
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            Email: {r.student_email || '-'} &bull; AI Dastlabki Ball: <strong>{r.ai_score?.toFixed(1) || '6.0'}</strong> &bull; Status: <span className="text-orange-600 font-bold">{r.status}</span>
                          </p>
                        </div>
                        <div className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition">
                          Tekshirish →
                        </div>
                      </Link>
                    </li>
                  ))}
                  {speakingPending.length === 0 && (
                    <li className="p-12 text-center text-gray-500 font-medium">
                      Barcha speaking yozuvlari tekshirilgan. Hozircha navbatda yangi yozuvlar yo&apos;q.
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
