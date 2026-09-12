'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import ExamHeader from '@/components/ExamHeader';
import AudioRecorder from '@/components/AudioRecorder';
import { api } from '@/lib/api';
import { Question, SpeakingAnswer } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExamError from '@/components/ExamError';
import { useExamSession, saveDraft, readDraft } from '@/lib/exam';

export default function SpeakingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = String(params.testId);
  const session = useExamSession(testId, 'speaking');
  const setNumber = session.test?.set_number || 1;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [expired, setExpired] = useState(false);
  const [finishError, setFinishError] = useState('');
  const [finishing, setFinishing] = useState(false);

  const [partStatus, setPartStatus] = useState<Record<number, 'pending' | 'uploading' | 'completed'>>({
    1: 'pending', 2: 'pending', 3: 'pending'
  });

  const [part1Prompt, setPart1Prompt] = useState("- Can you tell me a little bit about your hometown?\n- Do you work or are you a student?\n- What do you enjoy most about your daily routine?");
  const [part2Prompt, setPart2Prompt] = useState("Describe an ambitious goal that you have achieved in your life.\nYou should say:\n- What the goal was\n- When and why you set it\n- What steps you took to achieve it\nand explain how you felt when you successfully accomplished it.");
  const [part3Prompt, setPart3Prompt] = useState("- In what ways do personal goals influence an individual's motivation?\n- Do you think people today set more realistic goals than previous generations?\n- How has technology affected people's expectations regarding personal success?");

  // Part 2 uchun 1 daqiqa tayyorgarlik taymeri va qoralama bloknot (Scratchpad)
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [isPrepActive, setIsPrepActive] = useState(false);
  const [prepNotes, setPrepNotes] = useState('');
  const [prepDone, setPrepDone] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPrepActive && prepTimeLeft > 0) {
      interval = setInterval(() => {
        setPrepTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsPrepActive(false);
            setPrepDone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPrepActive, prepTimeLeft]);

  useEffect(() => {
    async function loadData() {
      try {
        const topics: Question[] = await api.getSpeakingTopics(testId);
        if (topics.length !== 3) throw new Error('Speaking to‘plamida uchala topshiriq ham mavjud bo‘lishi kerak.');
        if (topics && topics.length > 0) {
          const p1 = topics.find((t: Question) => t.order_num === 1);
          const p2 = topics.find((t: Question) => t.order_num === 2);
          const p3 = topics.find((t: Question) => t.order_num === 3);
          if (p1?.question_text) setPart1Prompt(p1.question_text);
          if (p2?.question_text) setPart2Prompt(p2.question_text);
          if (p3?.question_text) setPart3Prompt(p3.question_text);
        }

        const results: SpeakingAnswer[] = await api.getSpeakingResults(testId);
        setPrepNotes(readDraft(`ielts_prep_${testId}`, ''));
        if (results && results.length > 0) {
          setPartStatus(prev => {
            const updated = { ...prev };
            results.forEach((r: SpeakingAnswer) => {
              if (r.part_number) updated[r.part_number] = 'completed';
            });
            return updated;
          });
        }
      } catch (e) {
        console.error("Mavjud speaking ma'lumotlarini yuklashda xatolik:", e);
        setLoadError(e instanceof Error ? e.message : 'Speaking yuklanmadi');
      } finally { setLoading(false); }
    }
    if (session.ready) void loadData();
  }, [testId, session.ready]);

  const handleAudioComplete = async (part: number, blob: Blob) => {
    setPartStatus(prev => ({ ...prev, [part]: 'uploading' }));
    try {
      await api.uploadSpeakingAudio(testId, part, blob);
      setPartStatus(prev => ({ ...prev, [part]: 'completed' }));
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Audio yuklashda xatolik yuz berdi';
      setPartStatus(prev => ({ ...prev, [part]: 'pending' }));
      throw new Error(message);
    }
  };

  const allCompleted = Object.values(partStatus).every(s => s === 'completed');
  const finish = async () => {
    if (finishing || Object.values(partStatus).includes('uploading')) return;
    setFinishing(true); setFinishError('');
    try { await api.finishSpeaking(testId); router.push(`/test/${testId}/results`); }
    catch (err) { setFinishError(err instanceof Error ? err.message : 'Speaking yakunlanmadi'); }
    finally { setFinishing(false); }
  };
  if (session.error || loadError) return <ProtectedRoute><ExamError message={session.error || loadError} /></ProtectedRoute>;
  if (loading || !session.ready) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId} active={!allCompleted && !expired}>
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-900">
          {/* Rasmiy Cambridge Imtihon Headeri */}
          <ExamHeader
            testTitle={`Academic Speaking — Set #${setNumber}`}
            durationMinutes={15}
            deadlineAt={session.state?.deadline_at}
            onTimeUp={() => setExpired(true)}
            isCompleted={allCompleted}
            storageKey={`ielts_timer_${testId}_speaking`}
          />

          <main className="flex-1 max-w-4xl w-full mx-auto py-8 px-4">
            {expired && <div role="alert" className="p-4 mb-5 bg-amber-50 border border-amber-300 rounded-xl">Speaking vaqti tugadi. Tayyor yozuvlarni 60 soniya ichida yuklang, so‘ng tekshiruvga yuboring. <button className="underline font-bold disabled:opacity-50" disabled={finishing || Object.values(partStatus).includes('uploading')} onClick={finish}>{finishing ? 'Yuborilmoqda…' : 'Speakingni yakunlash'}</button>{finishError && <p className="text-red-700 mt-2">{finishError}</p>}</div>}
            <div className="text-center mb-8">
              <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                IELTS Speaking
              </span>
              <h1 className="text-3xl font-black text-gray-900 mt-2">Speaking Bo&apos;limi (Part 1, 2, 3)</h1>
              <p className="text-gray-500 text-sm mt-1">
                Nutq ravonligi, so&apos;z boyligi, grammatika va talaffuz bo&apos;yicha topshiriqlar.
              </p>
            </div>

            {/* PART 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-gray-200 mb-6 transition">
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Part 1: Introduction &amp; Familiar Topics (4-5 daqiqa)
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  partStatus[1] === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {partStatus[1] === 'completed' ? 'Bajarildi ✓' : partStatus[1] === 'uploading' ? 'Yuklanmoqda...' : 'Kutilmoqda'}
                </span>
              </div>
              <p className="text-gray-800 mb-6 whitespace-pre-wrap leading-relaxed font-serif text-base">{part1Prompt}</p>

              {partStatus[1] !== 'completed' && (
                <AudioRecorder disabled={expired} onRecordingComplete={(blob) => handleAudioComplete(1, blob)} />
              )}
              {partStatus[1] === 'uploading' && (
                <div className="text-center py-6 text-blue-600 font-bold animate-pulse flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Audio qabul qilinmoqda va tahlil qilinmoqda...</span>
                </div>
              )}
              {partStatus[1] === 'completed' && (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl font-bold flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Part 1 audio yozuvi qabul qilindi va tahlil qilindi!</span>
                  </span>
                  <span className="text-xs text-green-800 bg-green-200/70 font-bold px-3 py-1 rounded-full">
                    ✓ Saqlandi
                  </span>
                </div>
              )}
            </div>

            {/* PART 2: CUE CARD (1 min prep + scratchpad) */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-gray-200 mb-6 transition">
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <span className="bg-purple-100 text-purple-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Part 2: Individual Long Turn — Cue Card
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  partStatus[2] === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {partStatus[2] === 'completed' ? 'Bajarildi ✓' : partStatus[2] === 'uploading' ? 'Yuklanmoqda...' : 'Kutilmoqda'}
                </span>
              </div>

              {/* Rasmiy Cue Card Kartasi */}
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-5 mb-5 font-serif text-gray-900 leading-relaxed">
                <h3 className="text-xs uppercase tracking-widest font-sans font-black text-amber-800 mb-2">CANDIDATE CUE CARD</h3>
                <div className="whitespace-pre-wrap font-medium">{part2Prompt}</div>
              </div>

              {/* 1 daqiqalik tayyorgarlik vositasi */}
              {partStatus[2] === 'pending' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                      <span>⏱️</span>
                      <span>1 Daqiqalik Tayyorgarlik Taymeri &amp; Qoralama Bloknot</span>
                    </span>
                    <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-full ${
                      prepTimeLeft > 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {prepTimeLeft > 0 ? `00:${String(prepTimeLeft).padStart(2, '0')}` : 'Vaqt tugadi!'}
                    </span>
                  </div>

                  {!isPrepActive && !prepDone && (
                    <button
                      onClick={() => setIsPrepActive(true)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition mb-3"
                    >
                      Tayyorgarlik vaqtini boshlash (1 min)
                    </button>
                  )}

                  <textarea
                    value={prepNotes}
                    onChange={(e) => { setPrepNotes(e.target.value); saveDraft(`ielts_prep_${testId}`, e.target.value); }}
                    placeholder="Qoralama eslatmalar (Notes)..."
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}

              {partStatus[2] !== 'completed' && (
                <AudioRecorder disabled={expired} maxSeconds={120} onRecordingComplete={(blob) => handleAudioComplete(2, blob)} />
              )}
              {partStatus[2] === 'uploading' && (
                <div className="text-center py-6 text-blue-600 font-bold animate-pulse flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Audio qabul qilinmoqda va tahlil qilinmoqda...</span>
                </div>
              )}
              {partStatus[2] === 'completed' && (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl font-bold flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Part 2 (Cue card) nutqi muvaffaqiyatli saqlandi!</span>
                  </span>
                  <span className="text-xs text-green-800 bg-green-200/70 font-bold px-3 py-1 rounded-full">
                    ✓ Saqlandi
                  </span>
                </div>
              )}
            </div>

            {/* PART 3: TWO-WAY DISCUSSION */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-gray-200 mb-6 transition">
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <span className="bg-indigo-100 text-indigo-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Part 3: Two-way Discussion (4-5 daqiqa)
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  partStatus[3] === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {partStatus[3] === 'completed' ? 'Bajarildi ✓' : partStatus[3] === 'uploading' ? 'Yuklanmoqda...' : 'Kutilmoqda'}
                </span>
              </div>
              <p className="text-gray-800 mb-6 whitespace-pre-wrap leading-relaxed font-serif text-base">{part3Prompt}</p>

              {partStatus[3] !== 'completed' && (
                <AudioRecorder disabled={expired} onRecordingComplete={(blob) => handleAudioComplete(3, blob)} />
              )}
              {partStatus[3] === 'uploading' && (
                <div className="text-center py-6 text-blue-600 font-bold animate-pulse flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Audio qabul qilinmoqda va tahlil qilinmoqda...</span>
                </div>
              )}
              {partStatus[3] === 'completed' && (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl font-bold flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Part 3 audio yozuvi qabul qilindi va tahlil qilindi!</span>
                  </span>
                  <span className="text-xs text-green-800 bg-green-200/70 font-bold px-3 py-1 rounded-full">
                    ✓ Saqlandi
                  </span>
                </div>
              )}
            </div>

            {/* BARCHA BO'LIMLAR YAKUNLANGANIDA NATIJA TUGMASI */}
            {allCompleted && (
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-8 rounded-3xl text-center mt-8 shadow-xl animate-in zoom-in-95">
                <h2 className="text-3xl font-black mb-2">Speaking javoblari qabul qilindi!</h2>
                <p className="text-blue-100 mb-6 text-sm max-w-lg mx-auto">
                  Javoblaringiz ustoz tekshiruviga yuborildi. Baho va izohlar tasdiqlangandan so&apos;ng ko&apos;rinadi.
                </p>
                <button
                  onClick={() => router.push(`/test/${testId}/results`)}
                  className="bg-white text-blue-900 hover:bg-blue-50 px-10 py-4 rounded-2xl font-black text-lg transition shadow-2xl transform hover:scale-105"
                >
                  Natijalar holatini ko&apos;rish &rarr;
                </button>
              </div>
            )}
          </main>
        </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
