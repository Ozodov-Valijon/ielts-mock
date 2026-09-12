'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import { Test, ReviewIdentity } from '@/lib/types';

export default function AdminTestsPage() {
  const [tests, setTests] = useState<(Test & ReviewIdentity)[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api.adminGetTests().then(rows => { if (!cancelled) setTests(rows); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Testlar yuklanmadi'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const rows = tests.filter(test => `${test.student_name} ${test.student_email || ''} ${test.id}`.toLowerCase().includes(search.toLowerCase()));
  return <ProtectedRoute requireAdmin><main className="max-w-6xl mx-auto py-8 px-4">
    <Link href="/admin" className="text-blue-700 underline">← Admin panel</Link>
    <h1 className="text-3xl font-bold my-6">Barcha testlar</h1>
    <label htmlFor="test-search" className="block text-sm font-medium mb-2">Talaba yoki test raqami</label>
    <input id="test-search" value={search} onChange={event => setSearch(event.target.value)} className="border rounded-xl p-3 w-full max-w-md mb-6" />
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <LoadingSpinner /> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm text-left">
      <thead className="bg-slate-100"><tr>{['Test', 'Talaba', 'Set / rejim', 'Holat', 'Band'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
      <tbody>{rows.map(test => <tr key={test.id} className="border-t">
        <td className="p-4">#{test.id}</td><td className="p-4">{test.student_name}<div className="text-gray-500">{test.student_email}</div></td>
        <td className="p-4">{test.set_number} / {test.test_mode}</td><td className="p-4">{({completed: 'Tugallangan', pending_review: 'Tekshiruv kutilmoqda', in_progress: 'Davom etmoqda', terminated: 'Bekor qilingan'} as Record<string, string>)[test.status] || test.status}</td>
        <td className="p-4 font-bold">{test.status === 'completed' ? test.overall_band_score?.toFixed(1) ?? '—' : '—'}</td>
      </tr>)}</tbody>
    </table>{!rows.length && <p className="p-5 text-gray-500">Test topilmadi.</p>}</div>}
  </main></ProtectedRoute>;
}
