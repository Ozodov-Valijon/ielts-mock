'use client';

import { Feedback } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function OfficialTRF({ feedback, testId }: { feedback: Feedback; testId: string }) {
  const { user } = useAuth();
  const scores = [
    ['Listening', feedback.listening_score],
    ['Reading', feedback.reading_score],
    ['Writing', feedback.writing_score],
    ['Speaking', feedback.speaking_score],
    ['Overall', feedback.overall_band],
  ] as const;
  return (
    <section className="my-8 max-w-4xl mx-auto">
      <div className="flex justify-end mb-4 print:hidden">
        <button onClick={() => window.print()} className="bg-blue-700 text-white font-bold px-5 py-3 rounded-xl">
          Hisobotni chop etish / PDF saqlash
        </button>
      </div>
      <div className="bg-white text-gray-900 border-2 border-gray-300 rounded-xl p-6 sm:p-8 print:shadow-none">
        <h2 className="text-2xl font-bold">IELTS Mock — mashq natijalari</h2>
        <p className="mt-2 text-sm text-gray-600">
          Bu rasmiy IELTS sertifikati emas. Bandlar mustaqil mashq uchun taxminiy ko&apos;rsatkichdir.
        </p>
        <dl className="grid grid-cols-2 gap-4 my-6 text-sm">
          <div><dt className="text-gray-500">Talaba</dt><dd className="font-bold">{user?.full_name || '—'}</dd></div>
          <div><dt className="text-gray-500">Mashq raqami</dt><dd className="font-bold">#{testId}</dd></div>
        </dl>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {scores.map(([label, score]) => (
            <div key={label} className="border rounded-lg p-4 text-center">
              <p className="text-sm">{label}</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{score == null ? '—' : score.toFixed(1)}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm font-semibold">
          {feedback.is_approved ? 'Natija tasdiqlangan.' : 'Yakuniy natija hali tasdiqlanmagan.'}
        </p>
        <p className="mt-2 text-xs text-gray-500">Chiziq bilan ko&apos;rsatilgan bo&apos;lim baholanmagan yoki ushbu mashqqa kiritilmagan. Writing va Speaking ballari mentor tasdig&apos;idan keyin ochiladi.</p>
      </div>
    </section>
  );
}
