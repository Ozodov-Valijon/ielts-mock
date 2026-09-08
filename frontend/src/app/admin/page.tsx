'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_tests: 0,
    pending_reviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.adminGetStats();
        setStats(data);
      } catch (err) {
        console.error("Statistikani yuklashda xatolik:", err);
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
          <p className="text-gray-500 text-sm">Platforma statistikasi va o'quv jarayonini boshqarish</p>
        </div>
        
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin/students" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-200 text-center flex flex-col items-center justify-center h-40 group">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                <span className="font-bold text-gray-900 text-lg">Talabalar Ro'yxati</span>
                <span className="text-xs text-gray-500 mt-1">Barcha foydalanuvchilar va statistikalar</span>
              </Link>
              <Link href="/admin/review" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-200 text-center flex flex-col items-center justify-center h-40 group relative">
                {stats.pending_reviews > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                    {stats.pending_reviews} ta
                  </div>
                )}
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📝</span>
                <span className="font-bold text-gray-900 text-lg">Tekshirish Navbati</span>
                <span className="text-xs text-gray-500 mt-1">Writing & Speaking javoblari</span>
              </Link>
              <Link href="/admin/questions" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-200 text-center flex flex-col items-center justify-center h-40 group">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                <span className="font-bold text-gray-900 text-lg">Savol Qo'shish</span>
                <span className="text-xs text-gray-500 mt-1">Reading, Listening, Writing, Speaking</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
