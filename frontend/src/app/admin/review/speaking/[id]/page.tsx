'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AudioPlayer from '@/components/AudioPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface SpeakingDetail {
  id: number;
  test_id: number;
  part_number: number;
  audio_url?: string;
  transcript?: string;
  ai_analysis?: string;
  ai_score?: number;
  admin_feedback?: string;
  admin_score?: number;
  status: string;
  reviewed_at?: string;
  student_name: string;
  student_email: string;
  tab_switches?: number;
  paste_attempts?: number;
  is_flagged_cheating?: boolean;
}

interface ParsedSpeakingAi {
  overall_band?: number;
  ai_score?: number;
  fluency_coherence?: { score?: number; comment?: string };
  lexical_resource?: { score?: number; comment?: string };
  grammatical_range?: { score?: number; comment?: string };
  pronunciation?: { score?: number; comment?: string };
  summary?: string;
}

export default function AdminReviewSpeakingDetail() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [speaking, setSpeaking] = useState<SpeakingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.adminGetSpeakingDetail(id);
        setSpeaking(data);
        if (data.admin_score) setScore(data.admin_score);
        else if (data.ai_score) setScore(data.ai_score);
        if (data.admin_feedback) setFeedback(data.admin_feedback);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Speaking javobini yuklashda xatolik";
        console.error(msg);
        alert(msg);
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
      await api.adminReviewSpeaking(id, {
        admin_score: Number(score),
        admin_feedback: feedback || "Mentor tomonidan tasdiqlandi."
      });
      alert('Speaking muvaffaqiyatli baholandi va tasdiqlandi!');
      router.push('/admin/review');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Saqlashda xatolik yuz berdi";
      alert(msg);
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

  let parsedAi: ParsedSpeakingAi | null = null;
  if (speaking?.ai_analysis) {
    try {
      parsedAi = JSON.parse(speaking.ai_analysis);
    } catch {
      parsedAi = null;
    }
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Part {speaking?.part_number || 1} Baholash
              </span>
              <span className="text-gray-500 text-sm font-semibold">
                Talaba: <strong className="text-gray-900">{speaking?.student_name || "Noma'lum"}</strong> ({speaking?.student_email || 'Email yo\'q'})
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Speaking Javobini Tekshirish</h1>
          </div>
          <button 
            onClick={() => router.push('/admin/review')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg transition"
          >
            ← Navbatga qaytish
          </button>
        </div>

        {/* Anti-Cheat Audit Banner */}
        <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          speaking?.is_flagged_cheating 
            ? 'bg-red-50 border-red-200 text-red-900' 
            : 'bg-green-50 border-green-200 text-green-900'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{speaking?.is_flagged_cheating ? '🚨' : '🛡️'}</span>
            <div>
              <p className="font-bold text-sm">
                {speaking?.is_flagged_cheating 
                  ? "DIQQAT: Ushbu testda chiterlik ehtimoli yuqori deb belgilangan!"
                  : "Anti-Cheat Nazorati: Test intizom bilan topshirilgan."}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                Vkladkani almashtirish (Tab switch): <strong>{speaking?.tab_switches ?? 0} marta</strong> &bull; Tashqaridan nusxa ko&apos;chirish (Paste): <strong>{speaking?.paste_attempts ?? 0} marta</strong>
              </p>
            </div>
          </div>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full self-start sm:self-auto ${
            speaking?.is_flagged_cheating 
              ? 'bg-red-200 text-red-800' 
              : 'bg-green-200 text-green-800'
          }`}>
            {speaking?.is_flagged_cheating ? 'SHUBHALI TEST' : 'TOZA'}
          </span>
        </div>

        {/* Audio pleer va transkript */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Talabaning Audio Yozuvi</h2>
          {speaking?.audio_url ? (
            <AudioPlayer src={speaking.audio_url} allowReplay={true} />
          ) : (
            <p className="text-sm text-gray-500 italic">Audio fayl yuklanmagan</p>
          )}
          
          <div className="mt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Avtomatik Transkript (AI Whisper)</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-800 font-serif leading-relaxed text-sm">
              {speaking?.transcript || "Nutq matnga o'girilmagan"}
            </div>
          </div>
        </div>

        {/* AI tahlili */}
        {parsedAi && (
          <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-blue-950">AI Dastlabki Tahlili</h2>
              <span className="text-3xl font-black text-blue-700">
                {parsedAi.overall_band?.toFixed(1) || speaking?.ai_score?.toFixed(1) || '6.0'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-gray-500 font-bold block uppercase">Fluency</span>
                <strong className="text-base text-blue-900">{parsedAi.fluency_coherence?.score || '-'}</strong>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-gray-500 font-bold block uppercase">Lexical</span>
                <strong className="text-base text-blue-900">{parsedAi.lexical_resource?.score || '-'}</strong>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-gray-500 font-bold block uppercase">Grammar</span>
                <strong className="text-base text-blue-900">{parsedAi.grammatical_range?.score || '-'}</strong>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-gray-500 font-bold block uppercase">Pronunciation</span>
                <strong className="text-base text-blue-900">{parsedAi.pronunciation?.score || '-'}</strong>
              </div>
            </div>
            {parsedAi.summary && (
              <p className="text-xs text-blue-900 italic bg-white/70 p-3 rounded-lg">
                &quot;{parsedAi.summary}&quot;
              </p>
            )}
          </div>
        )}

        {/* Admin shakli */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Mentor Yakuniy Bahosi</h2>
          
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Feedback va Tavsiyalar</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
              placeholder="Talabaning talaffuzi, nutq ravonligi va lug'at boyligi bo'yicha tavsiyalaringiz..."
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
            {submitting ? 'Saqlanmoqda...' : 'Bahoni Tasdiqlash'}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
