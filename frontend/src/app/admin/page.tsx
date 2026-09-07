'use client';

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center">
            <span className="text-gray-500 font-medium mb-2">Jami talabalar</span>
            <span className="text-4xl font-bold text-blue-600">1,248</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center">
            <span className="text-gray-500 font-medium mb-2">Jami testlar</span>
            <span className="text-4xl font-bold text-green-600">3,492</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center">
            <span className="text-gray-500 font-medium mb-2">Kutilayotgan tekshiruvlar</span>
            <span className="text-4xl font-bold text-orange-500">42</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Tezkor amallar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/students" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-gray-100 text-center flex flex-col items-center justify-center h-32 group">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</span>
            <span className="font-bold text-gray-800">Talabalar ro'yxati</span>
          </Link>
          <Link href="/admin/review" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-gray-100 text-center flex flex-col items-center justify-center h-32 group relative">
            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">42</div>
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</span>
            <span className="font-bold text-gray-800">Tekshirish navbati</span>
          </Link>
          <Link href="/admin/questions" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-gray-100 text-center flex flex-col items-center justify-center h-32 group">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
            <span className="font-bold text-gray-800">Savol qo'shish</span>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
