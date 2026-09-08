'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import Timer from '@/components/Timer';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

export default function WritingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = String(params.testId);

  const [activeTab, setActiveTab] = useState<'task1' | 'task2'>('task1');
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);

  useEffect(() => {
    async function loadExisting() {
      try {
        const results = await api.getWritingResults(testId);
        if (results && results.length > 0) {
          results.forEach((r: any) => {
            if (r.task_number === 1 && r.user_text) setTask1Text(r.user_text);
            if (r.task_number === 2 && r.user_text) setTask2Text(r.user_text);
          });
          const hasTask1 = results.some((r: any) => r.task_number === 1);
          const hasTask2 = results.some((r: any) => r.task_number === 2);
          if (hasTask1 && hasTask2) {
            setIsSubmitted(true);
            const scores = results.map((r: any) => (r.ai_score !== undefined && r.ai_score !== null ? r.ai_score : 0.0));
            setAiScore(Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 2) / 2);
          }
        }
      } catch (e) {
        console.error("Mavjud writing javoblarini yuklashda xatolik:", e);
      }
    }
    loadExisting();
  }, [testId]);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Task 1 va Task 2 yuborish
      const res1 = await api.submitWriting(testId, 1, task1Text || "No response provided for Task 1.");
      const res2 = await api.submitWriting(testId, 2, task2Text || "No response provided for Task 2.");
      
      const score1 = res1.ai_analysis?.ai_score !== undefined && res1.ai_analysis?.ai_score !== null ? res1.ai_analysis.ai_score : 0.0;
      const score2 = res2.ai_analysis?.ai_score !== undefined && res2.ai_analysis?.ai_score !== null ? res2.ai_analysis.ai_score : 0.0;
      // IELTS Writing formula: Task 1 (1/3) + Task 2 (2/3)
      const combined = Math.round(((score1 + 2 * score2) / 3) * 2) / 2;
      setAiScore(combined);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    router.push(`/test/${testId}/speaking`);
  };

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId} allowPaste={false}>
        <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              IELTS Writing (Anti-Cheat Faol)
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Writing Bo&apos;limi (Task 1 &amp; Task 2)</h1>
          </div>
          {!isSubmitted && <Timer durationMinutes={60} onTimeUp={handleSubmit} />}
        </div>

        {isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl font-extrabold mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Insholar Qabul Qilindi!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              AI dastlabki tahlilni yakunladi. Natijalar mentor tekshiruvi uchun navbatga qo'yildi.
            </p>
            {aiScore !== null && (
              <div className="inline-block bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 mb-8">
                <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Dastlabki AI Bahosi</span>
                <span className="text-4xl font-black text-blue-800">{aiScore.toFixed(1)}</span>
              </div>
            )}
            <div>
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition shadow transform hover:scale-105"
              >
                Keyingi: Speaking Bo&apos;limiga O&apos;tish →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition ${activeTab === 'task1' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('task1')}
              >
                Task 1 (Kamida 150 so&apos;z)
              </button>
              <button
                className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition ${activeTab === 'task2' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('task2')}
              >
                Task 2 (Kamida 250 so&apos;z)
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'task1' ? (
                <div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-sm text-gray-800 leading-relaxed">
                    <strong className="block text-blue-900 font-bold mb-1">Task 1 Topshirig&apos;i:</strong>
                    The bar chart illustrates the percentage of university graduates in three European countries who found full-time employment within six months of graduation between 2010 and 2020.
                    Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
                  </div>
                  <textarea
                    value={task1Text}
                    onChange={(e) => setTask1Text(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      alert("DIQQAT: Tashqaridan nusxa ko'chirish (Paste) qat'iyan taqiqlangan! Inshoni o'zingiz yozishingiz shart.");
                    }}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    className="w-full h-80 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-serif leading-relaxed"
                    placeholder="Task 1 matnini shu yerga klaviaturada yozing..."
                  ></textarea>
                  <div className="mt-2 text-sm font-medium text-gray-500 flex justify-between items-center">
                    <span>Tavsiya etilgan vaqt: 20 daqiqa</span>
                    <span>So&apos;zlar soni: <strong className={wordCount(task1Text) < 150 ? 'text-orange-500' : 'text-green-600'}>{wordCount(task1Text)}</strong> / 150</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-sm text-gray-800 leading-relaxed">
                    <strong className="block text-blue-900 font-bold mb-1">Task 2 Topshirig&apos;i:</strong>
                    Some educators argue that technological advancement and artificial intelligence will eventually replace traditional classroom teaching, while others believe that the physical presence of a human teacher remains indispensable.
                    Discuss both views and present your personal perspective with relevant examples.
                  </div>
                  <textarea
                    value={task2Text}
                    onChange={(e) => setTask2Text(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      alert("DIQQAT: Tashqaridan nusxa ko'chirish (Paste) qat'iyan taqiqlangan! Inshoni o'zingiz yozishingiz shart.");
                    }}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    className="w-full h-80 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-serif leading-relaxed"
                    placeholder="Task 2 matnini shu yerga klaviaturada yozing..."
                  ></textarea>
                  <div className="mt-2 text-sm font-medium text-gray-500 flex justify-between items-center">
                    <span>Tavsiya etilgan vaqt: 40 daqiqa</span>
                    <span>So&apos;zlar soni: <strong className={wordCount(task2Text) < 250 ? 'text-orange-500' : 'text-green-600'}>{wordCount(task2Text)}</strong> / 250</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500">Ikkala topshiriq ham baholanadi</span>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition shadow disabled:opacity-50"
              >
                {submitting ? 'Yuborilmoqda...' : 'Writing Javoblarini Yuborish'}
              </button>
            </div>
          </div>
        )}
        </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
