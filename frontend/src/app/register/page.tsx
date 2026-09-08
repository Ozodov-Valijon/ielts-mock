'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Kiritilgan parollar bir-biriga mos kelmadi');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password
      });
      alert("Akkaunt muvaffaqiyatli yaratildi! Endi tizimga kiring.");
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Yangi Hisob
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Ro&apos;yxatdan O&apos;tish</h1>
          <p className="text-gray-500 text-xs mt-1">Platformadan bepul foydalanish uchun ma&apos;lumotlaringizni kiriting</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">To&apos;liq Ism (Full Name)</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              placeholder="Masalan: Valijon Ozodov"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Manzil</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              placeholder="talaba@ielts.uz"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Telefon Raqam (ixtiyoriy)</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parol</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              placeholder="Kamida 6 ta belgi"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parolni Tasdiqlang</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              placeholder="Parolni qayta kiriting"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 mt-4 rounded-xl hover:bg-blue-700 transition shadow disabled:opacity-50"
          >
            {loading ? 'Yaratilmoqda...' : 'Ro\'yxatdan O\'tish'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Akkauntingiz bormi?{' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
