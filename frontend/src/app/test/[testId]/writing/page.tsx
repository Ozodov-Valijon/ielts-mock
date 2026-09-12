'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import ExamHeader from '@/components/ExamHeader';
import { api } from '@/lib/api';
import { Question, WritingAnswer } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExamError from '@/components/ExamError';
import { useExamSession, nextExamRoute } from '@/lib/exam';

export default function WritingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = String(params.testId);
  const session = useExamSession(testId, 'writing');
  const setNumber = session.test?.set_number || 1;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const submittedTasks = useRef(new Set<number>());

  const [activeTab, setActiveTab] = useState<'task1' | 'task2'>('task1');
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  const [task1Prompt, setTask1Prompt] = useState('The bar chart illustrates the percentage of university graduates in three European countries who found full-time employment within six months of graduation between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.');
  const [task2Prompt, setTask2Prompt] = useState('Some educators argue that technological advancement and artificial intelligence will eventually replace traditional classroom teaching, while others believe that the physical presence of a human teacher remains indispensable. Discuss both views and present your personal perspective with relevant examples.');
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sozlamalar va Avto-saqlash
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [contrast, setContrast] = useState<'standard' | 'high-contrast'>('standard');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dastlabki ma'lumotlarni va LocalStorage qoralamasini yuklash
  useEffect(() => {
    if (!session.ready) return;
    async function loadData() {
      try {
        const topics: Question[] = await api.getWritingTopics(testId);
        if (topics.length !== 2) throw new Error('Writing to‘plamida ikkala topshiriq ham mavjud bo‘lishi kerak.');
        if (topics && topics.length > 0) {
          const t1 = topics.find((t) => t.order_num === 1);
          const t2 = topics.find((t) => t.order_num === 2);
          if (t1?.question_text) setTask1Prompt(t1.question_text);
          if (t2?.question_text) setTask2Prompt(t2.question_text);
        }

        // 1. Agar backendda avval saqlangan bo'lsa
        const results: WritingAnswer[] = await api.getWritingResults(testId);
        submittedTasks.current = new Set(results.map(r => r.task_number));
        let loadedT1 = '';
        let loadedT2 = '';
        if (results && results.length > 0) {
          results.forEach((r) => {
            if (r.task_number === 1 && r.user_text) loadedT1 = r.user_text;
            if (r.task_number === 2 && r.user_text) loadedT2 = r.user_text;
          });
          const hasTask1 = results.some((r) => r.task_number === 1);
          const hasTask2 = results.some((r) => r.task_number === 2);
          if (hasTask1 && hasTask2) {
            setIsSubmitted(true);
          }
        }

        // 2. LocalStorage zaxira qoralamasini tekshirish
        const draftT1 = localStorage.getItem(`ielts_draft_${testId}_t1`);
        const draftT2 = localStorage.getItem(`ielts_draft_${testId}_t2`);

        setTask1Text(loadedT1 || draftT1 || '');
        setTask2Text(loadedT2 || draftT2 || '');
      } catch (e) {
        console.error("Writing ma'lumotlarini yuklashda xatolik:", e);
        setLoadError(e instanceof Error ? e.message : 'Writing yuklanmadi');
      } finally { setLoading(false); }
    }
    loadData();
  }, [testId, session.ready]);

  // Avtomatik saqlash (Har 3 soniyada LocalStorage ga saqlaydi)
  useEffect(() => {
    if (isSubmitted || loading) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`ielts_draft_${testId}_t1`, task1Text);
        localStorage.setItem(`ielts_draft_${testId}_t2`, task2Text);
      } catch { setLastSavedTime('Saqlash imkoni yo‘q'); return; }
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [task1Text, task2Text, testId, isSubmitted, loading]);

  const wordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(w => w.length > 0).length;
  };

  const count1 = wordCount(task1Text);
  const count2 = wordCount(task2Text);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (submitting || isSubmitted || loading) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (submittedTasks.current.size === 0) {
        await api.submitWritingBatch(testId, task1Text, task2Text);
        submittedTasks.current.add(1);
        submittedTasks.current.add(2);
      }
      for (const task of [1, 2]) {
        if (submittedTasks.current.has(task)) continue;
        await api.submitWriting(testId, task, task === 1 ? task1Text : task2Text);
        submittedTasks.current.add(task);
      }
      setIsSubmitted(true);

      // Muvaffaqiyatli topshirilgach qoralamani tozalash
      localStorage.removeItem(`ielts_draft_${testId}_t1`);
      localStorage.removeItem(`ielts_draft_${testId}_t2`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      console.error(msg);
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (session.test) router.push(nextExamRoute(session.test, 'writing'));
  };

  const fontClass = fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';
  if (session.error || loadError) return <ProtectedRoute><ExamError message={session.error || loadError} /></ProtectedRoute>;
  if (loading || !session.ready) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId} allowPaste={false} active={!isSubmitted}>
        <div className={`min-h-screen flex flex-col ${contrast === 'high-contrast' ? 'bg-black text-yellow-300' : 'bg-[#f8fafc] text-gray-900'}`}>
          {/* Rasmiy Cambridge Imtihon Headeri */}
          <ExamHeader
            testTitle={`Academic Writing — Set #${setNumber}`}
            durationMinutes={60}
            deadlineAt={session.state?.deadline_at}
            onTimeUp={handleSubmit}
            isCompleted={isSubmitted}
            storageKey={`ielts_timer_${testId}_writing`}
            onFontChange={setFontSize}
            onContrastChange={setContrast}
          />

          {/* Asosiy Ish Maydoni */}
          <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 flex flex-col overflow-hidden">
            {isSubmitted ? (
              <div className="max-w-xl mx-auto my-auto p-10 rounded-2xl border border-green-200 text-center bg-white shadow-sm">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl font-extrabold mx-auto mb-4">
                  ✓
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Insholar Muvaffaqiyatli Qabul Qilindi!</h2>
                <p className="text-gray-600 mb-6">
                  Insholaringiz saqlandi. Ustoz tekshirganidan keyin tasdiqlangan baho va izohlar natijalar sahifasida ko&apos;rinadi.
                </p>
                <div>
                  <button
                    onClick={handleNext}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold transition shadow-lg transform hover:scale-102"
                  >
                    {session.test?.test_mode === 'full' ? 'Keyingi: Speaking' : 'Natijalarni ko‘rish'} &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden shadow-xs bg-white border-gray-200">
                {/* Task 1 va Task 2 Tab Bar */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('task1')}
                      className={`px-5 py-2.5 font-bold text-sm rounded-xl transition flex items-center space-x-2 ${
                        activeTab === 'task1'
                          ? 'bg-blue-700 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>Task 1</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        count1 >= 150 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {count1}/150
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('task2')}
                      className={`px-5 py-2.5 font-bold text-sm rounded-xl transition flex items-center space-x-2 ${
                        activeTab === 'task2'
                          ? 'bg-blue-700 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>Task 2 (Muhimroq, 2/3 ball)</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        count2 >= 250 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {count2}/250
                      </span>
                    </button>
                  </div>

                  {/* Avtomatik Saqlash Ko'rsatkichi */}
                  {lastSavedTime && (
                    <div className="hidden sm:flex items-center space-x-1.5 text-xs text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      <span>💾</span>
                      <span>Avtosaqlandi: {lastSavedTime}</span>
                    </div>
                  )}
                </div>

                {/* Split Screen: Chapda Topshiriq, O'ngda Matn Kiritish */}
                <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 overflow-hidden">
                  {/* Chap: Topshiriq ko'rsatmasi */}
                  <div className="w-full md:w-5/12 p-5 sm:p-6 overflow-y-auto max-h-[calc(100vh-210px)] bg-gray-50/60">
                    <div className="mb-4">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                        {activeTab === 'task1' ? 'Task 1 Prompt (Kamida 150 so\'z)' : 'Task 2 Prompt (Kamida 250 so\'z)'}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {activeTab === 'task1' 
                          ? "Tavsiya etilgan vaqt: 20 daqiqa. Berilgan diagramma yoki jarayonni xolisona tahlil qiling." 
                          : "Tavsiya etilgan vaqt: 40 daqiqa. Ikkala fikrni muhokama qiling va o'z shaxsiy nuqtai nazaringizni bildiring."}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs font-serif leading-relaxed text-gray-800 text-sm whitespace-pre-wrap">
                      {activeTab === 'task1' ? task1Prompt : task2Prompt}
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800 mb-1">Ko&apos;rsatma:</p>
                      <p>Task 1 uchun kamida 150 so&apos;z, Task 2 uchun kamida 250 so&apos;z yozish talab etiladi.</p>
                    </div>
                  </div>

                  {/* O'ng: Matn Kiritish Maydoni */}
                  <div className="w-full md:w-7/12 p-4 sm:p-6 flex flex-col max-h-[calc(100vh-210px)]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Sizning Inshoingiz ({activeTab.toUpperCase()})
                      </span>
                      <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                        (activeTab === 'task1' ? count1 >= 150 : count2 >= 250)
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        <span>📝 So&apos;zlar soni:</span>
                        <span className="font-mono text-sm">{activeTab === 'task1' ? count1 : count2}</span>
                        <span>/ {activeTab === 'task1' ? 150 : 250}</span>
                      </div>
                    </div>

                    <textarea
                      value={activeTab === 'task1' ? task1Text : task2Text}
                      onChange={(e) => {
                        if (activeTab === 'task1') setTask1Text(e.target.value);
                        else setTask2Text(e.target.value);
                      }}
                      spellCheck={false}
                      placeholder={
                        activeTab === 'task1'
                          ? "Write your Task 1 essay here (minimum 150 words)..."
                          : "Write your Task 2 essay here (minimum 250 words)..."
                      }
                      className={`flex-1 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none leading-relaxed font-mono ${fontClass} ${
                        contrast === 'high-contrast' ? 'bg-gray-900 text-yellow-300 border-yellow-500' : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    />

                    {submitError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                        ⚠️ {submitError}
                      </div>
                    )}

                    {/* Pastki Harakatlar Paneli */}
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Task 1: <strong className={count1 >= 150 ? 'text-green-600' : 'text-amber-600'}>{count1}</strong> so&apos;z</span>
                        <span>&bull;</span>
                        <span>Task 2: <strong className={count2 >= 250 ? 'text-green-600' : 'text-amber-600'}>{count2}</strong> so&apos;z</span>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-7 py-2.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                      >
                        {submitting ? (
                          <span>Insholar tekshirilmoqda...</span>
                        ) : (
                          <>
                            <span>Insholarni Yakunlash &amp; Topshirish</span>
                            <span>&rarr;</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
