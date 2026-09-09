'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import ExamHeader from '@/components/ExamHeader';
import AudioRecorder from '@/components/AudioRecorder';
import { api } from '@/lib/api';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function SpeakingTestPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = String(params.testId);
  const setNumber = Number(searchParams?.get('set')) || 1;

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
        const topics = await api.getSpeakingTopics(testId, setNumber);
        if (topics && topics.length > 0) {
          const p1 = topics.find((t: any) => t.order_num === 1);
          const p2 = topics.find((t: any) => t.order_num === 2);
          const p3 = topics.find((t: any) => t.order_num === 3);
          if (p1?.question_text) setPart1Prompt(p1.question_text);
          if (p2?.question_text) setPart2Prompt(p2.question_text);
          if (p3?.question_text) setPart3Prompt(p3.question_text);
        }

        const results = await api.getSpeakingResults(testId);
        if (results && results.length > 0) {
          setPartStatus(prev => {
            const updated = { ...prev };
            results.forEach((r: any) => {
              if (r.part_number) updated[r.part_number] = 'completed';
            });
            return updated;
          });
        }
      } catch (e) {
        console.error("Mavjud speaking ma'lumotlarini yuklashda xatolik:", e);
      }
    }
    loadData();
  }, [testId, setNumber]);

  const handleAudioComplete = async (part: number, blob: Blob) => {
    setPartStatus(prev => ({ ...prev, [part]: 'uploading' }));
    try {
      await api.uploadSpeakingAudio(testId, part, blob);
      setPartStatus(prev => ({ ...prev, [part]: 'completed' }));
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Audio yuklashda xatolik yuz berdi');
      setPartStatus(prev => ({ ...prev, [part]: 'pending' }));
    }
  };

  const allCompleted = Object.values(partStatus).every(s => s === 'completed');

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId}>
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-900">
          {/* Rasmiy Cambridge Imtihon Headeri */}
          <ExamHeader
            testTitle={`Academic Speaking — Set #${setNumber}`}
            durationMinutes={15}
            onTimeUp={() => {}}
            isCompleted={allCompleted}
          />

          <main className="flex-1 max-w-4xl w-full mx-auto py-8 px-4">
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

              {partStatus[1] === 'pending' && (
                <AudioRecorder onRecordingComplete={(blob) => handleAudioComplete(1, blob)} />
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
                  <button 
                    onClick={() => setPartStatus(prev => ({ ...prev, 1: 'pending' }))}
                    className="text-xs text-green-700 underline hover:text-green-900"
                  >
                    Qayta yozish
                  </button>
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
                    onChange={(e) => setPrepNotes(e.target.value)}
                    placeholder="Qoralama eslatmalar (Notes)..."
                    rows={2}
                    className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}

              {partStatus[2] === 'pending' && (
                <AudioRecorder onRecordingComplete={(blob) => handleAudioComplete(2, blob)} />
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
                  <button 
                    onClick={() => setPartStatus(prev => ({ ...prev, 2: 'pending' }))}
                    className="text-xs text-green-700 underline hover:text-green-900"
                  >
                    Qayta yozish
                  </button>
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

              {partStatus[3] === 'pending' && (
                <AudioRecorder onRecordingComplete={(blob) => handleAudioComplete(3, blob)} />
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
                  <button 
                    onClick={() => setPartStatus(prev => ({ ...prev, 3: 'pending' }))}
                    className="text-xs text-green-700 underline hover:text-green-900"
                  >
                    Qayta yozish
                  </button>
                </div>
              )}
            </div>

            {/* BARCHA BO'LIMLAR YAKUNLANGANIDA NATIJA TUGMASI */}
            {allCompleted && (
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-8 rounded-3xl text-center mt-8 shadow-xl animate-in zoom-in-95">
                <h2 className="text-3xl font-black mb-2">🎉 To&apos;liq IELTS Mock Testi Yakunlandi!</h2>
                <p className="text-blue-100 mb-6 text-sm max-w-lg mx-auto">
                  Siz Reading, Listening, Writing va Speaking bo&apos;limlarini to&apos;liq topshirdingiz. Rasmiy IELTS Test Report Form (TRF) sertifikati tayyorlandi.
                </p>
                <button
                  onClick={() => router.push(`/test/${testId}/results`)}
                  className="bg-white text-blue-900 hover:bg-blue-50 px-10 py-4 rounded-2xl font-black text-lg transition shadow-2xl transform hover:scale-105"
                >
                  Rasmiy TRF Sertifikatini Ko&apos;rish &amp; Yuklab Olish &rarr;
                </button>
              </div>
            )}
          </main>
        </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
