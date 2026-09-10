'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Test, TestSet } from '@/lib/types';
import { nextExamRoute } from '@/lib/exam';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressChart from '@/components/ProgressChart';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [catalog, setCatalog] = useState<TestSet[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [startingTest, setStartingTest] = useState(false);

  // Tanlov Modali (Modal state for Section & Set selection)
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'reading' | 'listening' | 'writing' | 'speaking' | 'full'>('full');
  const [selectedSet, setSelectedSet] = useState<number>(1);

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const [data, sets] = await Promise.all([api.getTests(), api.getTestSets()]);
        setTests(data);
        setCatalog(sets);
        const preferred = sets.find(s => s.is_complete) || sets[0];
        if (preferred) setSelectedSet(preferred.set_number);
      } catch (err) {
        console.error("Testlarni yuklashda xatolik:", err);
        setLoadError(err instanceof Error ? err.message : 'Ma‘lumotlar yuklanmadi');
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  const handleStartExam = async () => {
    if (startingTest || !catalog.some(s => s.set_number === selectedSet && s.available_modes.includes(selectedSection))) return;
    setStartingTest(true);
    try {
      // 1. Yangi test yaratish (set_number va test_mode ni bazaga to'g'ri saqlash)
      const newTest = await api.createTest({
        set_number: selectedSet,
        test_mode: selectedSection
      });

      // Imtihon boshlanganligini saqlash (qayta kirish hiylalarini oldini olish uchun)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`ielts_exam_active_${newTest.id}`, 'true');
      }
      
      // 2. Fullscreen rejimiga kirishga harakat qilish
      try {
        interface ExtendedElement extends HTMLElement {
          webkitRequestFullscreen?: () => Promise<void>;
        }
        const docEl = document.documentElement as ExtendedElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      } catch (fsErr) {
        console.warn("Fullscreen ochish talabi:", fsErr);
      }

      // 3. Tanlangan bo'lim va variant bo'yicha yo'naltirish
      const targetSection = selectedSection === 'full' ? 'reading' : selectedSection;
      router.push(`/test/${newTest.id}/${targetSection}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Test yaratishda xatolik yuz berdi';
      console.error(msg);
      alert(msg);
      setStartingTest(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {loadError && <p role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl mb-4">{loadError}</p>}
        {/* Banner va Boshqaruv */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Talaba Kabineti
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Salom, {user?.full_name}!</h1>
            <p className="text-gray-500 text-sm">O&apos;z bilimingizni sinab ko&apos;rishga tayyormisiz?</p>
          </div>
          
          <button 
            onClick={() => setShowConfigModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl transition transform hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <span>🚀</span>
            <span>Yangi Test Boshlash</span>
          </button>
        </div>

        {/* Target Band Tracker & O'quv Statistikasi Widgeti */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-blue-300 bg-white/10 px-3 py-1 rounded-full">
                IELTS Maqsadingiz
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Mening Maqsadim: <span className="text-yellow-400">Band 7.5+</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
                Muntazam mock testlar topshirish va natijalarni tahlil qilish orqali o&apos;z ko&apos;nikmalaringizni oshiring.
              </p>
            </div>

            {/* Statistik Kartochkalar */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl text-center border border-white/10">
                <span className="text-[10px] sm:text-xs text-gray-300 font-bold uppercase block">Jami Test</span>
                <span className="text-2xl sm:text-3xl font-black text-white">{tests.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl text-center border border-white/10">
                <span className="text-[10px] sm:text-xs text-gray-300 font-bold uppercase block">Eng Yuqori</span>
                <span className="text-2xl sm:text-3xl font-black text-yellow-400">
                  {tests.length > 0 && Math.max(...tests.map(t => t.overall_band_score || 0)) > 0
                    ? Math.max(...tests.map(t => t.overall_band_score || 0)).toFixed(1)
                    : '—'}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl text-center border border-white/10">
                <span className="text-[10px] sm:text-xs text-gray-300 font-bold uppercase block">O&apos;rtacha</span>
                <span className="text-2xl sm:text-3xl font-black text-green-400">
                  {(() => {
                    const completed = tests.filter(t => t.overall_band_score && t.overall_band_score > 0);
                    if (completed.length === 0) return '—';
                    const avg = completed.reduce((a, b) => a + (b.overall_band_score || 0), 0) / completed.length;
                    return avg.toFixed(1);
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tezkor Bo'lim Tanlash Kartochkalari */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => {
              setSelectedSection('reading');
              setShowConfigModal(true);
            }}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold mb-3 group-hover:scale-110 transition">
              📖
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Reading</h3>
            <p className="text-xs text-gray-500 mt-0.5">Akademik matn va savollar</p>
          </div>

          <div 
            onClick={() => {
              setSelectedSection('listening');
              setShowConfigModal(true);
            }}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-3 group-hover:scale-110 transition">
              🎧
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Listening</h3>
            <p className="text-xs text-gray-500 mt-0.5">Audio dialoglar va faktlar</p>
          </div>

          <div 
            onClick={() => {
              setSelectedSection('writing');
              setShowConfigModal(true);
            }}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-bold mb-3 group-hover:scale-110 transition">
              ✍️
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Writing</h3>
            <p className="text-xs text-gray-500 mt-0.5">Task 1 va Task 2 insholari</p>
          </div>

          <div 
            onClick={() => {
              setSelectedSection('speaking');
              setShowConfigModal(true);
            }}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl font-bold mb-3 group-hover:scale-110 transition">
              🗣️
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Speaking</h3>
            <p className="text-xs text-gray-500 mt-0.5">Part 1, 2, 3 ovozli suhbat</p>
          </div>
        </div>

        {/* O'sish Dinamikasi Chart */}
        {tests.filter(t => t.overall_band_score && t.overall_band_score > 0).length > 0 && (
          <div className="mb-8">
            <ProgressChart 
              tests={tests
                .filter(t => t.overall_band_score && t.overall_band_score > 0)
                .slice(0, 5)
                .map(t => ({
                  test_id: t.id,
                  overall_band: t.overall_band_score || 0,
                  date: t.started_at ? new Date(t.started_at).toLocaleDateString('uz-UZ') : `#${t.id}`
                }))} 
            />
          </div>
        )}

        {/* Testlar Ro'yxati Jadvali */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Sizning Mock Testlaringiz</h2>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border">
              Jami: {tests.length} ta test
            </span>
          </div>
          
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner /></div>
          ) : tests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">📝</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Hali hech qanday test topshirmadingiz</h3>
              <p className="text-gray-500 text-sm mb-6">Birinchi to&apos;liq IELTS mock testingizni hoziroq boshlang!</p>
              <button 
                onClick={() => setShowConfigModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition cursor-pointer"
              >
                Testni Boshlash
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Test ID</th>
                    <th className="px-6 py-4 font-bold">Boshlangan Sana</th>
                    <th className="px-6 py-4 font-bold">Holat</th>
                    <th className="px-6 py-4 font-bold text-center">Band Score</th>
                    <th className="px-6 py-4 font-bold text-center">Bo&apos;limlarga O&apos;tish</th>
                    <th className="px-6 py-4 font-bold text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {tests.map(test => (
                    <tr key={test.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">#{test.id}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {test.started_at ? new Date(test.started_at).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          test.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.status === 'completed' ? 'Tasdiqlangan ✓' : test.status === 'pending_review' ? 'Ustoz tekshiruvida' : test.status === 'terminated' ? 'Bekor qilingan' : 'Jarayonda'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-center text-base text-blue-700">
                        {test.overall_band_score != null ? test.overall_band_score.toFixed(1) : '-'}
                      </td>
                      
                      {/* Har bir bo'limga tezkor kirish tugmalari */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs text-gray-500">Set {test.set_number} · {test.test_mode === 'full' ? '4 bo‘lim' : test.test_mode}</span>
                        {test.status === 'in_progress' && <Link className="block text-blue-700 underline font-bold mt-1" href={nextExamRoute(test)}>Davom ettirish →</Link>}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Link 
                          href={`/test/${test.id}/results`} 
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-4 py-2 rounded-xl text-xs transition inline-block border border-blue-200"
                        >
                          Natijani Ko&apos;rish →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ⚙️ IMTIHONNI TANLASH VA SOZLASH MODALI */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fadeIn">
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">IELTS Mock Configurator</span>
                  <h2 className="text-2xl font-black text-gray-900 mt-0.5">Test Bo&apos;limi va Variantini Tanlang</h2>
                </div>
                <button 
                  onClick={() => setShowConfigModal(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* 1. Bo'lim tanlash */}
              <div className="mb-6">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  1. Imtihon Rejimi:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div 
                    onClick={() => setSelectedSection('full')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-3 ${
                      selectedSection === 'full' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-extrabold text-sm">To&apos;liq Mock (4 ta bo&apos;lim)</div>
                      <div className="text-[11px] text-gray-500">Reading → Listening → Writing → Speaking</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('reading')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-3 ${
                      selectedSection === 'reading' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">📖</span>
                    <div>
                      <div className="font-extrabold text-sm">Faqat Reading</div>
                      <div className="text-[11px] text-gray-500">60 daqiqa &bull; Akademik matn</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('listening')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-3 ${
                      selectedSection === 'listening' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">🎧</span>
                    <div>
                      <div className="font-extrabold text-sm">Faqat Listening</div>
                      <div className="text-[11px] text-gray-500">30 daqiqa &bull; Audio yozuv</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('writing')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-3 ${
                      selectedSection === 'writing' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">✍️</span>
                    <div>
                      <div className="font-extrabold text-sm">Faqat Writing</div>
                      <div className="text-[11px] text-gray-500">Task 1 &bull; Task 2 insho</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('speaking')}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-3 sm:col-span-2 ${
                      selectedSection === 'speaking' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">🗣️</span>
                    <div>
                      <div className="font-extrabold text-sm">Faqat Speaking</div>
                      <div className="text-[11px] text-gray-500">Part 1, 2, 3 audio yozib olish</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Variant / Set tanlash */}
              <div className="mb-6">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  2. Imtihon Varianti (Test Set):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalog.map(set => <button key={set.set_number} type="button" onClick={() => setSelectedSet(set.set_number)} disabled={!set.available_modes.includes(selectedSection)} className={`text-left p-4 rounded-2xl border-2 disabled:opacity-40 ${selectedSet === set.set_number ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                    <strong className="block text-sm">{set.title}</strong>
                    <span className="block text-xs text-gray-600 mt-1">{set.is_complete ? 'To‘liq mashq' : 'Demo'} · R {set.counts.reading} / L {set.counts.listening} / W {set.counts.writing} / S {set.counts.speaking}</span>
                    {!set.audio_ready && <span className="text-xs text-amber-700">Listening audio tayyor emas</span>}
                  </button>)}
                </div>
              </div>

              {/* 3. Xavfsizlik shartlari eslatmasi */}
              <div className="bg-blue-50 text-blue-900 border border-blue-200 p-4 rounded-2xl mb-6 text-xs flex items-center space-x-3">
                <span className="text-2xl">🖥️</span>
                <div>
                  <strong className="block font-bold">Imtihon rejimi</strong>
                  Test haqiqiy IELTS formati kabi to&apos;liq ekranda (Fullscreen) o&apos;tkaziladi.
                </div>
              </div>

              {/* Tugmalar */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleStartExam}
                  disabled={startingTest || !catalog.some(s => s.set_number === selectedSet && s.available_modes.includes(selectedSection))}
                  className="flex-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black py-3.5 px-6 rounded-2xl transition shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{startingTest ? 'Boshlanmoqda...' : '🖥️ To\'liq Ekranda Boshlash'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
