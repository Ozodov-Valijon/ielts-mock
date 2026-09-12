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
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 mb-5">
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Part 1: Kirish va umumiy savollar (4-5 daqiqa)
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  partStatus[1] === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {partStatus[1] === 'completed' ? 'Bajarildi' : partStatus[1] === 'uploading' ? 'Yuklanmoqda...' : 'Kutilmoqda'}
                </span>
              </div>
              <p className="text-gray-800 mb-5 whitespace-pre-wrap leading-relaxed font-serif text-sm">{part1Prompt}</p>

              {partStatus[1] !== 'completed' && (
                <AudioRecorder disabled={expired} onRecordingComplete={(blob) => handleAudioComplete(1, blob)} />
              )}
              {partStatus[1] === 'uploading' && (
                <div className="flex items-center justify-center gap-2 py-4 text-blue-700 text-xs font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Audio saqlanmoqda va tahlil qilinmoqda...</span>
                </div>
              )}
              {partStatus[1] === 'completed' && (
                <div className="bg-green-50 text-green-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border border-green-200">
                  <span>Part 1 audio yozuvi saqlandi</span>
                  <span className="text-xs bg-green-200/70 px-2.5 py-0.5 rounded-md">Saqlandi</span>
                </div>
              )}
            </div>

            {/* PART 2: CUE CARD (1 min prep + scratchpad) */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 mb-5">
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Part 2: Individual chiqish — Cue Card
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  partStatus[2] === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {partStatus[2] === 'completed' ? 'Bajarildi' : partStatus[2] === 'uploading' ? 'Yuklanmoqda...' : 'Kutilmoqda'}
                </span>
              </div>

              {/* Rasmiy Cue Card Kartasi */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 mb-4 font-serif text-gray-900 leading-relaxed text-sm">
                <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-amber-800 mb-2">CANDIDATE CUE CARD</h3>
                <div className="whitespace-pre-wrap">{part2Prompt}</div>
              </div>

              {/* 1 daqiqalik tayyorgarlik vositasi */}
              {partStatus[2] === 'pending' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      1 daqiqalik tayyorgarlik va qoralama
                    </span>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                      prepTimeLeft > 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {prepTimeLeft > 0 ? `00:${String(prepTimeLeft).padStart(2, '0')}` : 'Vaqt tugadi'}
                    </span>
                  </div>

                  {!isPrepActive && !prepDone && (
                    <button
                      onClick={() => setIsPrepActive(true)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition mb-2.5 cursor-pointer"
                    >
                      Tayyorgarlik vaqtini boshlash (1 min)
                    </button>
                  )}

                  <textarea
                    value={prepNotes}
                    onChange={(e) => { setPrepNotes(e.target.value); saveDraft(`ielts_prep_${testId}`, e.target.value); }}
                    placeholder="Qoralama eslatmalar (Notes)..."
                    rows={2}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}

              {partStatus[2] !== 'completed' && (
                <AudioRecorder disabled={expired} maxSeconds={120} onRecordingComplete={(blob) => handleAudioComplete(2, blob)} />
              )}
              {partStatus[2] === 'uploading' && (
                <div className="flex items-center justify-center gap-2 py-4 text-blue-700 text-xs font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Audio saqlanmoqda va tahlil qilinmoqda...</span>
                </div>
              )}
              {partStatus[2] === 'completed' && (
                <div className="bg-green-50 text-green-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border border-green-200">
                  <span>Part 2 audio yozuvi saqlandi</span>
                  <span className="text-xs bg-green-200/70 px-2.5 py-0.5 rounded-md">Saqlandi</span>
                </div>
              )}
            </div>

            {/* PART 3: TWO-WAY DISCUSSION */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 mb-5">
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Part 3: Muhokama savollari (4-5 daqiqa)
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  partStatus[3] === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {partStatus[3] === 'completed' ? 'Bajarildi' : partStatus[3] === 'uploading' ? 'Yuklanmoqda...' : 'Kutilmoqda'}
                </span>
              </div>
              <p className="text-gray-800 mb-5 whitespace-pre-wrap leading-relaxed font-serif text-sm">{part3Prompt}</p>

              {partStatus[3] !== 'completed' && (
                <AudioRecorder disabled={expired} onRecordingComplete={(blob) => handleAudioComplete(3, blob)} />
              )}
              {partStatus[3] === 'uploading' && (
                <div className="flex items-center justify-center gap-2 py-4 text-blue-700 text-xs font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Audio saqlanmoqda va tahlil qilinmoqda...</span>
                </div>
              )}
              {partStatus[3] === 'completed' && (
                <div className="bg-green-50 text-green-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border border-green-200">
                  <span>Part 3 audio yozuvi saqlandi</span>
                  <span className="text-xs bg-green-200/70 px-2.5 py-0.5 rounded-md">Saqlandi</span>
                </div>
              )}
            </div>

            {/* BARCHA BO'LIMLAR YAKUNLANGANIDA NATIJA TUGMASI */}
            {allCompleted && (
              <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center mt-6 shadow-xs max-w-md mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Speaking bo&apos;limi yakunlandi</h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Ovozli javoblaringiz saqlandi va tekshiruv uchun yuborildi.
                </p>
                <button
                  onClick={() => router.push(`/test/${testId}/results`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-xl font-semibold text-sm transition cursor-pointer"
                >
                  Natijalarni ko&apos;rish &rarr;
                </button>
              </div>
            )}
          </main>
        </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
