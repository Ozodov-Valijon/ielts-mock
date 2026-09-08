'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
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

  const renderPart = (partNum: number, title: string, prompt: string) => {
    const status = partStatus[partNum];
    
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 transition">
        <div className="flex items-center justify-between mb-3 border-b pb-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {title}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {status === 'completed' ? 'Bajarildi ✓' : status === 'uploading' ? 'Yuklanmoqda...' : 'Kutilmoqda'}
          </span>
        </div>
        <p className="text-gray-800 mb-6 whitespace-pre-wrap leading-relaxed font-medium">{prompt}</p>
        
        {status === 'pending' && (
          <AudioRecorder onRecordingComplete={(blob) => handleAudioComplete(partNum, blob)} />
        )}
        
        {status === 'uploading' && (
          <div className="text-center py-6 text-blue-600 font-bold animate-pulse flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Audio serverga yuklanmoqda va tahlil qilinmoqda...</span>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Part {partNum} audio yozuvi qabul qilindi va tahlil qilindi!</span>
            </div>
            <button 
              onClick={() => setPartStatus(prev => ({ ...prev, [partNum]: 'pending' }))}
              className="text-xs text-green-700 underline hover:text-green-900"
            >
              Qayta yozish
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId}>
        <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            IELTS Speaking (Set #{setNumber})
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Speaking Bo&apos;limi (Part 1, 2, 3)</h1>
          <p className="text-gray-600 text-sm mt-1">Mikrofon orqali savollarga ingliz tilida javob bering va yozuvni to&apos;xtating.</p>
        </div>

        {renderPart(1, 'Part 1: Introduction & Familiar Topics', part1Prompt)}
        {renderPart(2, 'Part 2: Individual Long Turn (Cue Card)', part2Prompt)}
        {renderPart(3, 'Part 3: Two-way Discussion', part3Prompt)}

        {allCompleted && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl text-center mt-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">🎉 Barcha Test Bo&apos;limlari Yakunlandi!</h2>
            <p className="text-blue-100 mb-6 text-sm">
              Siz to&apos;liq IELTS Mock testini (Reading, Listening, Writing, Speaking) muvaffaqiyatli topshirdingiz.
            </p>
            <button
              onClick={() => router.push(`/test/${testId}/results`)}
              className="bg-white text-blue-800 hover:bg-blue-50 px-10 py-4 rounded-xl font-extrabold text-lg transition shadow-lg transform hover:scale-105"
            >
              Yakuniy Natijalarni Ko&apos;rish →
            </button>
          </div>
        )}
        </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
