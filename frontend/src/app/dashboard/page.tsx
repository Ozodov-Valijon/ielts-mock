'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Test } from '../../lib/types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking fetch tests
    setTimeout(() => {
      setTests([
        { id: 1, user_id: 1, status: 'completed', overall_band_score: 7.0, started_at: '2026-09-01T10:00:00Z', completed_at: '2026-09-01T12:30:00Z' },
        { id: 2, user_id: 1, status: 'pending', started_at: '2026-09-05T14:00:00Z' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const startNewTest = async () => {
    try {
      // const res = await api.createTest();
      // router.push(`/test/${res.id}/reading`);
      
      // Mock start test
      const newTestId = 3;
      router.push(`/test/${newTestId}/reading`);
    } catch (error) {
      console.error(error);
      alert('Test yaratishda xatolik');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Salom, {user?.full_name}!</h1>
          <button 
            onClick={startNewTest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition"
          >
            Yangi test boshlash
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Sizning testlaringiz</h2>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : tests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Hali test topshirmadingiz.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Sana</th>
                    <th className="px-6 py-3 font-medium">Holat</th>
                    <th className="px-6 py-3 font-medium">Ball (Band)</th>
                    <th className="px-6 py-3 font-medium text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tests.map(test => (
                    <tr key={test.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-800">
                        {new Date(test.started_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          test.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.status === 'completed' ? 'Tugallangan' : 'Jarayonda / Tekshirilmoqda'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {test.overall_band_score ? test.overall_band_score.toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {test.status === 'completed' ? (
                          <Link href={`/test/${test.id}/results`} className="text-blue-600 hover:text-blue-800 font-medium">
                            Natijani ko'rish
                          </Link>
                        ) : (
                          <span className="text-gray-400">Kutilmoqda</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
