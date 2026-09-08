'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

export default function AdminReviewWritingDetail() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [writing, setWriting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.adminGetWritingDetail(id);
        setWriting(data);
        if (data.admin_score) setScore(data.admin_score);
        else if (data.ai_score) setScore(data.ai_score);
        if (data.admin_feedback) setFeedback(data.admin_feedback);
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Writing javobini yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleApprove = async () => {
    if (!score) {
      alert("Iltimos, bahoni kiriting");
      return;
    }
    setSubmitting(true);
    try {
      await api.adminReviewWriting(id, {
        admin_score: Number(score),
        admin_feedback: feedback || "Mentor tomonidan tasdiqlandi."
      });
      alert('Writing muvaffaqiyatli baholandi va tasdiqlandi!');
      router.push('/admin/review');
    } catch (err: any) {
      alert(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      </ProtectedRoute>
    );
  }

  let parsedAi: any = null;
  if (writing?.ai_analysis) {
    try {
      parsedAi = JSON.parse(writing.ai_analysis);
    } catch {
      parsedAi = null;
    }
  }

  const wordCount = writing?.user_text ? writing.user_text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Task {writing?.task_number || 1} Baholash
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Writing Javobini Tekshirish</h1>
          </div>
          <button 
            onClick={() => router.push('/admin/review')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg transition"
          >
            ← Navbatga qaytish
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chap ustun: Talaba matni */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-3 border-b pb-3">
              <h2 className="text-lg font-bold text-gray-800">Talaba Inshosi</h2>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                So'zlar soni: <strong>{wordCount}</strong>
              </span>
            </div>
            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap font-serif leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-200 flex-1 overflow-y-auto max-h-[500px]">
              {writing?.user_text || "Matn yo'q"}
            </div>
          </div>

          {/* O'ng ustun: AI tahlili va Admin formasi */}
          <div className="flex flex-col gap-6">
            {parsedAi && (
              <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-200 p-6">
                <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-3">
                  <h2 className="text-lg font-bold text-blue-950">Sun'iy Intellekt (AI) Tahlili</h2>
                  <span className="text-3xl font-black text-blue-700">
                    {parsedAi.overall_band?.toFixed(1) || writing?.ai_score?.toFixed(1) || '6.0'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-gray-500 font-bold block uppercase">Task Achievement</span>
                    <strong className="text-lg text-blue-900">{parsedAi.task_achievement?.score || '-'}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-gray-500 font-bold block uppercase">Coherence & Cohesion</span>
                    <strong className="text-lg text-blue-900">{parsedAi.coherence_cohesion?.score || '-'}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-gray-500 font-bold block uppercase">Lexical Resource</span>
                    <strong className="text-lg text-blue-900">{parsedAi.lexical_resource?.score || '-'}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-gray-500 font-bold block uppercase">Grammar Range</span>
                    <strong className="text-lg text-blue-900">{parsedAi.grammatical_range?.score || '-'}</strong>
                  </div>
                </div>
                {parsedAi.summary && (
                  <p className="text-xs text-blue-900 leading-relaxed italic bg-white/70 p-3 rounded-lg">
                    "{parsedAi.summary}"
                  </p>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Mentor Yakuniy Bahosi</h2>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Feedback va Izoh</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
                  placeholder="Talabaga ushbu insho bo'yicha shaxsiy maslahat va tavsiyalaringizni yozing..."
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Yakuniy Ball (Band Score 1 - 9)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="9"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value) || '')}
                  className="w-32 text-2xl font-black p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-center text-blue-800"
                />
              </div>

              <button
                onClick={handleApprove}
                disabled={submitting || !score}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition shadow disabled:opacity-50"
              >
                {submitting ? 'Saqlanmoqda...' : "Bahoni Tasdiqlash va E'lon Qilish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
