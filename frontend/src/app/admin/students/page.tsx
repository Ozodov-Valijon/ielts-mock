'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import Link from 'next/link';

interface AdminStudentItem {
  id: number;
  email: string | null;
  full_name: string;
  phone?: string;
  test_count: number;
  created_at: string;
}

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const data = await api.adminGetStudents();
        setStudents(data);
      } catch (err) {
        console.error("Talabalarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const filtered = students.filter(s => 
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Talabalar Ro&apos;yxati
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Ro&apos;yxatdan O&apos;tgan Talabalar</h1>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition"
          >
            ← Admin Dashboard
          </Link>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Ism yoki email bo'yicha qidirish..."
            className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">F.I.SH</th>
                  <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-4 font-bold text-xs text-gray-500 uppercase tracking-wider text-center">Testlar Soni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400 font-bold">{i + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{s.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{s.email}</td>
                    <td className="px-6 py-4 text-gray-500">{s.phone || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                        {s.test_count} ta
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                      Talabalar topilmadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
