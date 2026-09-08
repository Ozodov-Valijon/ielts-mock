'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Test } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTest, setStartingTest] = useState(false);

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const data = await api.getTests();
        setTests(data);
      } catch (err) {
        console.error("Testlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  const startNewTest = async () => {
    if (startingTest) return;
    setStartingTest(true);
    try {
      const newTest = await api.createTest();
      router.push(`/test/${newTest.id}/reading`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Test yaratishda xatolik yuz berdi');
      setStartingTest(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Talaba Kabineti
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Salom, {user?.full_name}!</h1>
            <p className="text-gray-500 text-sm">O&apos;z bilimingizni sinab ko&apos;rishga tayyormisiz?</p>
          </div>
          <button 
            onClick={startNewTest}
            disabled={startingTest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg transition transform hover:scale-105 disabled:opacity-50"
          >
            {startingTest ? 'Test boshlanmoqda...' : '🚀 Yangi Test Boshlash'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Sizning Mock Testlaringiz</h2>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border">
              Jami: {tests.length} ta test
            </span>
          </div>
          
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner /></div>
          ) : tests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">📝</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Hali hech qanday test topshirmadingiz</h3>
              <p className="text-gray-500 text-sm mb-6">Birinchi to&apos;liq IELTS mock testingizni hoziroq boshlang!</p>
              <button 
                onClick={startNewTest}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
              >
                Testni Boshlash
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Test ID</th>
                    <th className="px-6 py-4 font-bold">Boshlangan Sana</th>
                    <th className="px-6 py-4 font-bold">Holat</th>
                    <th className="px-6 py-4 font-bold text-center">Band Score</th>
                    <th className="px-6 py-4 font-bold text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {tests.map(test => (
                    <tr key={test.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">#{test.id}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {test.started_at ? new Date(test.started_at).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          test.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.status === 'completed' ? 'Tugallangan ✓' : 'Jarayonda'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-center text-base text-blue-700">
                        {test.overall_band_score ? test.overall_band_score.toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {test.status === 'in_progress' && (
                          <Link 
                            href={`/test/${test.id}/reading`} 
                            className="bg-green-50 text-green-700 hover:bg-green-100 font-bold px-3 py-1.5 rounded-lg text-xs transition inline-block"
                          >
                            Davom ettirish →
                          </Link>
                        )}
                        <Link 
                          href={`/test/${test.id}/results`} 
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs transition inline-block"
                        >
                          Natijani Ko&apos;rish →
                        </Link>
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
