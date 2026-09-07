'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    // Mock students
    setStudents([
      { id: 1, full_name: 'Ali Valiyev', email: 'ali@example.com', test_count: 5 },
      { id: 2, full_name: 'Zarina Gofurova', email: 'zarina@example.com', test_count: 2 },
      { id: 3, full_name: 'Rustam Karimov', email: 'rustam@example.com', test_count: 0 },
    ]);
  }, []);

  const filtered = students.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Talabalar</h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Ism bo'yicha qidirish..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-600">#</th>
                <th className="px-6 py-4 font-bold text-gray-600">Ism</th>
                <th className="px-6 py-4 font-bold text-gray-600">Email</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-center">Testlar soni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4 font-medium">{s.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{s.email}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{s.test_count}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Talaba topilmadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
