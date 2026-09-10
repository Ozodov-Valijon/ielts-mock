'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Email/telefon yoki parol xato kiritildi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            IELTS Mock Portal
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Tizimga Kirish</h1>
          <p className="text-gray-500 text-xs mt-1">Hisobingizga kiring va test topshirishni davom eting</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-6 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email yoki Telefon Raqam</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              placeholder="talaba@ielts.uz yoki +998901234567"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parol (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-900 leading-relaxed border border-blue-100">
            <strong>Sinov hisoblari:</strong><br />
            • Talaba: <code>student@ielts.uz</code> / <code>student123</code><br />
            • Telefon: <code>+998907654321</code> / <code>student123</code><br />
            • Admin: <code>admin@ielts.uz</code> / <code>admin123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow disabled:opacity-50"
          >
            {loading ? 'Kirilmoqda...' : 'Tizimga Kirish'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Akkauntingiz yo&apos;qmi?{' '}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  );
}
