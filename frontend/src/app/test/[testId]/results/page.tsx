'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScoreCard from '@/components/ScoreCard';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Feedback } from '@/lib/types';
import { api } from '@/lib/api';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = String(params.testId);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<'reading' | 'listening'>('reading');

  useEffect(() => {
    async function loadFeedback() {
      try {
        setLoading(true);
        const data = await api.getFeedback(testId);
        setFeedback(data);
      } catch (err: any) {
        console.error("Natijalarni yuklashda xatolik:", err);
        setError(err.message || "Natijalarni hisoblashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [testId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Test ballaringiz hisoblanmoqda...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !feedback) {
    return (
      <ProtectedRoute>
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-red-200 text-center shadow-sm">
          <div className="text-red-500 text-5xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Natija Topilmadi</h2>
          <p className="text-gray-600 text-sm mb-6">{error || "Ushbu test bo'yicha ma'lumot mavjud emas."}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition"
          >
            Dashboard ga qaytish
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const getBandLabel = (band: number) => {
    if (band >= 8.5) return "Expert User (C2)";
    if (band >= 7.5) return "Very Good User (C1)";
    if (band >= 6.5) return "Good User (B2/C1)";
    if (band >= 5.5) return "Competent User (B2)";
    if (band >= 4.5) return "Modest User (B1)";
    if (band >= 3.5) return "Limited User (A2/B1)";
    if (band >= 2.0) return "Intermittent User (A1/A2)";
    if (band >= 1.0) return "Non User (A1)";
    return "Did Not Attempt / 0.0";
  };

  const antiCheat = feedback.anti_cheat || { tab_switches: 0, paste_attempts: 0, is_flagged_cheating: false };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Sarlavha */}
        <div className="text-center mb-8">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            IELTS Mock Test Sertifikati
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2">Sizning Test Natijalaringiz</h1>
          <p className="text-gray-600 text-sm mt-1">Mock Test #{testId} bo&apos;yicha rasmiy IELTS shkalasi tahlili</p>
        </div>

        {/* Anti-Cheat Xavfsizlik Audit Kartasi */}
        <div className={`p-4 rounded-2xl border mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
          antiCheat.is_flagged_cheating 
            ? 'bg-red-50 border-red-300 text-red-900' 
            : antiCheat.tab_switches > 0 
            ? 'bg-yellow-50 border-yellow-300 text-yellow-900' 
            : 'bg-green-50 border-green-300 text-green-900'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">
              {antiCheat.is_flagged_cheating ? '🚨' : antiCheat.tab_switches > 0 ? '⚠️' : '🛡️'}
            </span>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide">
                {antiCheat.is_flagged_cheating 
                  ? 'Chiterlik Shubhasi Qayd Etildi' 
                  : antiCheat.tab_switches > 0 
                  ? 'Kichik Qoidabuzarliklar Aniqlangan' 
                  : 'Anti-Cheat: Imtihon 100% Halol Topshirildi'}
              </h4>
              <p className="text-xs opacity-90">
                Tab almashtirishlar: <strong>{antiCheat.tab_switches} marta</strong> &bull; Tashqaridan matn ko&apos;chirish (Paste): <strong>{antiCheat.paste_attempts} marta</strong>
              </p>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider ${
            antiCheat.is_flagged_cheating 
              ? 'bg-red-600 text-white' 
              : antiCheat.tab_switches > 0 
              ? 'bg-yellow-200 text-yellow-900' 
              : 'bg-green-600 text-white'
          }`}>
            {antiCheat.is_flagged_cheating ? 'Belgilangan (Flagged)' : antiCheat.tab_switches > 0 ? 'Ogohlantirilgan' : 'Toza (Verified) ✓'}
          </span>
        </div>
        
        {/* Katta Overall Band Score va 4 ta bo'lim */}
        <div className="flex flex-col md:flex-row gap-8 mb-10 items-center justify-center">
          <div className="w-64 h-64 rounded-full border-8 border-blue-600 flex flex-col items-center justify-center shadow-2xl bg-white transform hover:scale-105 transition">
            <span className="text-gray-400 font-extrabold tracking-widest text-xs uppercase mb-1">Overall Band</span>
            <span className="text-7xl font-black text-blue-900 leading-none">{feedback.overall_band.toFixed(1)}</span>
            <span className="text-xs text-blue-700 font-bold mt-2 bg-blue-50 px-3 py-0.5 rounded-full">
              {getBandLabel(feedback.overall_band)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1 w-full max-w-2xl">
            <ScoreCard title="Reading" score={feedback.reading_score} />
            <ScoreCard title="Listening" score={feedback.listening_score} />
            <ScoreCard title="Writing" score={feedback.writing_score} />
            <ScoreCard title="Speaking" score={feedback.speaking_score} />
          </div>
        </div>

        {/* Savolma-savol Tahlil Bo'limi (Review of Answers) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-10 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Savolma-Savol Javoblar Tahlili</h2>
              <p className="text-xs text-gray-500 mt-0.5">Xatolaringizni ko&apos;rib chiqing va to&apos;g&apos;ri javoblar bilan solishtiring</p>
            </div>
            <div className="flex bg-gray-200 p-1 rounded-xl">
              <button
                onClick={() => setActiveReviewTab('reading')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeReviewTab === 'reading' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reading ({feedback.reading_details?.length || 0} ta)
              </button>
              <button
                onClick={() => setActiveReviewTab('listening')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeReviewTab === 'listening' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Listening ({feedback.listening_details?.length || 0} ta)
              </button>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            {activeReviewTab === 'reading' ? (
              feedback.reading_details && feedback.reading_details.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-bold">#</th>
                      <th className="px-4 py-3 font-bold">Savol Matni</th>
                      <th className="px-4 py-3 font-bold">Sizning Javobingiz</th>
                      <th className="px-4 py-3 font-bold">To&apos;g&apos;ri Javob</th>
                      <th className="px-4 py-3 font-bold text-center">Natija</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feedback.reading_details.map((item, idx) => (
                      <tr key={item.question_id || idx} className={`hover:bg-gray-50 ${item.is_correct ? 'bg-green-50/40' : 'bg-red-50/40'}`}>
                        <td className="px-4 py-3.5 font-bold text-gray-500">{item.order_num || idx + 1}</td>
                        <td className="px-4 py-3.5 font-medium text-gray-800 max-w-xs">{item.question_text}</td>
                        <td className="px-4 py-3.5 font-mono text-xs">
                          <span className={item.is_correct ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
                            {item.user_answer || <span className="text-gray-400 italic">Javob berilmagan</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-900 font-bold">
                          {item.correct_answer}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {item.is_correct ? (
                            <span className="bg-green-100 text-green-800 text-xs font-black px-2.5 py-1 rounded-full">
                              ✓ To&apos;g&apos;ri (+1)
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-1 rounded-full">
                              ✗ Noto&apos;g&apos;ri (0)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-6 text-gray-500 text-sm">Reading javoblari mavjud emas.</p>
              )
            ) : (
              feedback.listening_details && feedback.listening_details.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-bold">#</th>
                      <th className="px-4 py-3 font-bold">Savol Matni</th>
                      <th className="px-4 py-3 font-bold">Sizning Javobingiz</th>
                      <th className="px-4 py-3 font-bold">To&apos;g&apos;ri Javob</th>
                      <th className="px-4 py-3 font-bold text-center">Natija</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feedback.listening_details.map((item, idx) => (
                      <tr key={item.question_id || idx} className={`hover:bg-gray-50 ${item.is_correct ? 'bg-green-50/40' : 'bg-red-50/40'}`}>
                        <td className="px-4 py-3.5 font-bold text-gray-500">{item.order_num || idx + 1}</td>
                        <td className="px-4 py-3.5 font-medium text-gray-800 max-w-xs">{item.question_text}</td>
                        <td className="px-4 py-3.5 font-mono text-xs">
                          <span className={item.is_correct ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
                            {item.user_answer || <span className="text-gray-400 italic">Javob berilmagan</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-900 font-bold">
                          {item.correct_answer}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {item.is_correct ? (
                            <span className="bg-green-100 text-green-800 text-xs font-black px-2.5 py-1 rounded-full">
                              ✓ To&apos;g&apos;ri (+1)
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-1 rounded-full">
                              ✗ Noto&apos;g&apos;ri (0)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-6 text-gray-500 text-sm">Listening javoblari mavjud emas.</p>
              )
            )}
          </div>
        </div>

        {/* Kuchli va Zaif tomonlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-2xl border border-green-200 shadow-sm">
            <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💪</span> Kuchli Tomonlar
            </h3>
            <div className="text-green-950 text-sm leading-relaxed whitespace-pre-line font-medium">
              {feedback.strengths || "Yaxshi natija ko'rsatildi."}
            </div>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
            <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">⚠️</span> Zaif Nuqtalar va Kamchiliklar
            </h3>
            <div className="text-orange-950 text-sm leading-relaxed whitespace-pre-line font-medium">
              {feedback.weaknesses || "Katta kamchiliklar kuzatilmadi."}
            </div>
          </div>
        </div>

        {/* Tavsiyalar */}
        {feedback.recommendations && (
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 mb-10 shadow-sm">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💡</span> Mentor va AI Tavsiyalari
            </h3>
            <div className="text-blue-950 text-sm leading-relaxed whitespace-pre-line font-medium">
              {feedback.recommendations}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-xl font-bold text-base transition shadow-xl transform hover:scale-105"
          >
            Dashboard ga Qaytish
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
