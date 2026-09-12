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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Salom, {user?.full_name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">IELTS mock imtihonlari va natijalar monitoringi</p>
          </div>
          
          <button 
            onClick={() => setShowConfigModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer text-sm"
          >
            <span>Yangi test boshlash</span>
          </button>
        </div>

        {/* Natijalar qisqacha ko'rsatkichlari */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-xs">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
            <div>
              <span className="text-xs text-gray-500 font-medium block">Jami topshirilgan</span>
              <span className="text-2xl font-bold text-gray-900 mt-1 block">{tests.length}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Eng yuqori ball</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">
                {tests.length > 0 && Math.max(...tests.map(t => t.overall_band_score || 0)) > 0
                  ? Math.max(...tests.map(t => t.overall_band_score || 0)).toFixed(1)
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">O&apos;rtacha ball</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">
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

        {/* Tezkor bo'lim kartochkalari */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div 
            onClick={() => {
              setSelectedSection('reading');
              setShowConfigModal(true);
            }}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
          >
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Bo&apos;lim</span>
            <h3 className="font-bold text-gray-900 text-base">Reading</h3>
            <p className="text-xs text-gray-500 mt-0.5">60 daqiqa &bull; 40 savol</p>
          </div>

          <div 
            onClick={() => {
              setSelectedSection('listening');
              setShowConfigModal(true);
            }}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
          >
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Bo&apos;lim</span>
            <h3 className="font-bold text-gray-900 text-base">Listening</h3>
            <p className="text-xs text-gray-500 mt-0.5">30 daqiqa &bull; 40 savol</p>
          </div>

          <div 
            onClick={() => {
              setSelectedSection('writing');
              setShowConfigModal(true);
            }}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
          >
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">Bo&apos;lim</span>
            <h3 className="font-bold text-gray-900 text-base">Writing</h3>
            <p className="text-xs text-gray-500 mt-0.5">60 daqiqa &bull; 2 topshiriq</p>
          </div>

          <div 
            onClick={() => {
              setSelectedSection('speaking');
              setShowConfigModal(true);
            }}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
          >
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1">Bo&apos;lim</span>
            <h3 className="font-bold text-gray-900 text-base">Speaking</h3>
            <p className="text-xs text-gray-500 mt-0.5">11-14 daqiqa &bull; 3 qism</p>
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
              <h3 className="text-base font-semibold text-gray-800 mb-1">Hozircha topshirilgan testlar yo&apos;q</h3>
              <p className="text-gray-500 text-sm mb-5">Bilimingizni sinash uchun yangi test boshlang.</p>
              <button 
                onClick={() => setShowConfigModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer text-sm"
              >
                Testni boshlash
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
                    <th className="px-6 py-4 font-bold text-center">Bo&apos;lim</th>
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          test.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.status === 'completed' ? 'Tasdiqlangan' : test.status === 'pending_review' ? 'Tekshiruvda' : test.status === 'terminated' ? 'To\'xtatilgan' : 'Jarayonda'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-center text-base text-blue-700">
                        {test.overall_band_score != null ? test.overall_band_score.toFixed(1) : '-'}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs text-gray-500">Set {test.set_number} · {test.test_mode === 'full' ? '4 bo‘lim' : test.test_mode}</span>
                        {test.status === 'in_progress' && <Link className="block text-blue-700 underline font-semibold mt-1 text-xs" href={nextExamRoute(test)}>Davom ettirish &rarr;</Link>}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Link 
                          href={`/test/${test.id}/results`} 
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg text-xs transition inline-block border border-blue-200"
                        >
                          Natijalar &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* IMTIHONNI TANLASH VA SOZLASH MODALI */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl border border-gray-200">
              
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Test parametrlarini tanlang</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Kerakli bo&apos;lim va topshiriqlar to&apos;plamini belgilang</p>
                </div>
                <button 
                  onClick={() => setShowConfigModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition"
                >
                  ✕
                </button>
              </div>

              {/* 1. Bo'lim tanlash */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  1. Imtihon formati:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div 
                    onClick={() => setSelectedSection('full')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedSection === 'full' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">To&apos;liq Mock (4 ta bo&apos;lim)</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Reading &bull; Listening &bull; Writing &bull; Speaking</div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('reading')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedSection === 'reading' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Faqat Reading</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">60 daqiqa &bull; 40 savol</div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('listening')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedSection === 'listening' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Faqat Listening</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">30 daqiqa &bull; 40 savol</div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('writing')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedSection === 'writing' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Faqat Writing</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Task 1 va Task 2 insholari</div>
                  </div>

                  <div 
                    onClick={() => setSelectedSection('speaking')}
                    className={`p-3 rounded-xl border transition cursor-pointer sm:col-span-2 ${
                      selectedSection === 'speaking' 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium' 
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Faqat Speaking</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Part 1, 2, 3 ovozli suhbat</div>
                  </div>
                </div>
              </div>

              {/* 2. Variant / Set tanlash */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  2. Savollar to&apos;plami (Set):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {catalog.map(set => (
                    <button 
                      key={set.set_number} 
                      type="button" 
                      onClick={() => setSelectedSet(set.set_number)} 
                      disabled={!set.available_modes.includes(selectedSection)} 
                      className={`text-left p-3 rounded-xl border transition disabled:opacity-40 cursor-pointer ${
                        selectedSet === set.set_number 
                          ? 'border-blue-600 bg-blue-50/50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <strong className="block text-sm text-gray-900">{set.title}</strong>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {set.is_complete ? 'To‘liq to‘plam' : 'Demo'} &bull; R: {set.counts.reading}, L: {set.counts.listening}, W: {set.counts.writing}, S: {set.counts.speaking}
                      </span>
                      {!set.audio_ready && <span className="text-xs text-amber-700 block mt-0.5">Audio tayyorlanmoqda</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Xavfsizlik eslatmasi */}
              <div className="bg-slate-50 text-slate-700 border border-slate-200 p-3 rounded-xl mb-5 text-xs">
                <strong className="block font-semibold text-slate-800 mb-0.5">To&apos;liq ekran tartibi</strong>
                Test xalqaro standartlarga muvofiq to&apos;liq ekran rejimida o&apos;tkaziladi.
              </div>

              {/* Tugmalar */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition cursor-pointer text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleStartExam}
                  disabled={startingTest || !catalog.some(s => s.set_number === selectedSet && s.available_modes.includes(selectedSection))}
                  className="flex-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                >
                  <span>{startingTest ? 'Boshlanmoqda...' : 'Imtihonni boshlash'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
