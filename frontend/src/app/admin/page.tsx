'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import Link from 'next/link';
import { AdminStats } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_students: 0,
    total_tests: 0,
    pending_reviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.adminGetStats();
        setStats(data);
      } catch (err) {
        console.error("Statistikani yuklashda xatolik:", err);
        setError(err instanceof Error ? err.message : 'Statistika yuklanmadi');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Boshqaruv Paneli
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Platforma statistikasi va o&apos;quv jarayonini boshqarish</p>
        </div>
        
        {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center"><span className="text-gray-500 font-bold text-xs uppercase">O‘rtacha tasdiqlangan band</span><p className="text-5xl font-black text-purple-600 mt-2">{stats.average_band?.toFixed(1) ?? '—'}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">Jami Talabalar</span>
                <span className="text-5xl font-black text-blue-600">{stats.total_students}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">Topshirilgan Testlar</span>
                <span className="text-5xl font-black text-green-600">{stats.total_tests}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">Kutilayotgan Tekshiruvlar</span>
                <span className="text-5xl font-black text-orange-500">{stats.pending_reviews}</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Tezkor Amallar</h2>
            <Link href="/admin/tests" className="inline-block text-blue-700 font-bold underline mb-5">Barcha talabalar testlarini ko‘rish →</Link>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin/students" className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-400 transition border border-gray-200 text-center flex flex-col items-center justify-center h-36">
                <span className="font-bold text-gray-900 text-base">Talabalar ro&apos;yxati</span>
                <span className="text-xs text-gray-500 mt-1">Foydalanuvchilar va umumiy statistika</span>
              </Link>
              <Link href="/admin/review" className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-400 transition border border-gray-200 text-center flex flex-col items-center justify-center h-36 relative">
                {stats.pending_reviews > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {stats.pending_reviews} ta
                  </div>
                )}
                <span className="font-bold text-gray-900 text-base">Tekshirish navbati</span>
                <span className="text-xs text-gray-500 mt-1">Writing va Speaking topshiriqlari</span>
              </Link>
              <Link href="/admin/questions" className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-400 transition border border-gray-200 text-center flex flex-col items-center justify-center h-36">
                <span className="font-bold text-gray-900 text-base">Savol qo&apos;shish</span>
                <span className="text-xs text-gray-500 mt-1">4 ta bo&apos;lim uchun yangi savollar</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
