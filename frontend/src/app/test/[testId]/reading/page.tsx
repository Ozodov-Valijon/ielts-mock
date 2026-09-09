'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import ExamHeader from '@/components/ExamHeader';
import QuestionPalette from '@/components/QuestionPalette';
import TextHighlighter from '@/components/TextHighlighter';
import QuestionCard from '@/components/QuestionCard';
import { api } from '@/lib/api';
import { Question } from '@/lib/types';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ReadingTestPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = String(params.testId);
  const setNumber = Number(searchParams?.get('set')) || 1;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultScore, setResultScore] = useState<number | null>(null);

  // Cambridge Navigatsiya & Sozlamalar
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewIndices, setReviewIndices] = useState<Set<number>>(new Set());
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [contrast, setContrast] = useState<'standard' | 'high-contrast'>('standard');
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await api.getReadingQuestions(testId, setNumber);
        setQuestions(data);
      } catch (err: any) {
        console.error("Savollarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [testId, setNumber]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleToggleReview = (index: number) => {
    setReviewIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const scrollToQuestion = (index: number) => {
    setCurrentIndex(index);
    if (questionRefs.current[index]) {
      questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = questions.map(q => ({
        question_id: q.id,
        user_answer: answers[q.id] || ''
      }));
      const res = await api.submitReadingAnswers(testId, payload);
      setResultScore(res.score);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    router.push(`/test/${testId}/listening?set=${setNumber}`);
  };

  if (loading) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  // Qaysi savollarga javob berilganligini hisoblash
  const answeredIndices = new Set(
    questions.map((q, idx) => (answers[q.id] && answers[q.id].trim() !== '' ? idx : -1)).filter(idx => idx !== -1)
  );

  const fontClass = fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId}>
        <div className={`min-h-screen flex flex-col ${contrast === 'high-contrast' ? 'bg-black text-yellow-300' : 'bg-[#f8fafc] text-gray-900'}`}>
          {/* Rasmiy Cambridge Imtihon Headeri */}
          <ExamHeader
            testTitle={`Academic Reading — Set #${setNumber}`}
            durationMinutes={60}
            onTimeUp={handleSubmit}
            isCompleted={resultScore !== null}
            onFontChange={setFontSize}
            onContrastChange={setContrast}
          />

          {/* Asosiy Ish Maydoni (Split Screen) */}
          <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Chap tomon: Reading Passage (Matnni ajratish va eslatma qoldirish imkoniyati bilan) */}
            <section aria-label="Reading Passage" className={`w-full md:w-1/2 rounded-xl border p-5 sm:p-7 overflow-y-auto max-h-[calc(100vh-130px)] shadow-xs ${
              contrast === 'high-contrast' ? 'bg-gray-950 border-yellow-500' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Reading Passage
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    ({questions.length} ta savol)
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                  Matnni belgilab eslatma qoldirishingiz mumkin (Highlight)
                </span>
              </div>

              <TextHighlighter
                content={questions[0]?.passage_text || "Reading matni yuklanmoqda..."}
                className={`${fontClass} leading-relaxed whitespace-pre-wrap`}
              />
            </section>

            {/* O'ng tomon: Savollar bloki */}
            <section aria-label="Savollar" className="w-full md:w-1/2 flex flex-col max-h-[calc(100vh-130px)]">
              <div className={`flex-1 rounded-xl border p-4 sm:p-6 overflow-y-auto ${
                contrast === 'high-contrast' ? 'bg-gray-950 border-yellow-500' : 'bg-white border-gray-200 shadow-xs'
              }`}>
                {resultScore !== null ? (
                  <div className="p-8 rounded-2xl border border-green-200 text-center my-auto bg-green-50/50">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-4">
                      ✓
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Reading Muvaffaqiyatli Yakunlandi!</h3>
                    <p className="text-gray-600 mb-4">Ushbu bo&apos;lim bo&apos;yicha hisoblangan rasmiy IELTS band bali:</p>
                    <div className="text-6xl font-black text-blue-700 mb-6">{resultScore.toFixed(1)}</div>
                    <button
                      onClick={handleProceed}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform hover:scale-105"
                    >
                      Keyingi: Listening Bo&apos;limiga O&apos;tish &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        ref={el => { questionRefs.current[idx] = el; }}
                        className="transition-all"
                      >
                        <QuestionCard
                          question={q}
                          index={idx + 1}
                          value={answers[q.id] || ''}
                          onChange={(val) => handleAnswerChange(q.id, val)}
                          isReviewed={reviewIndices.has(idx)}
                          onToggleReview={() => handleToggleReview(idx)}
                          isActive={currentIndex === idx}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* Pastki Cambridge Savollar Navigatsiya Lentasi */}
          {resultScore === null && (
            <div className="sticky bottom-0 z-30">
              <QuestionPalette
                totalQuestions={questions.length}
                currentIndex={currentIndex}
                answeredIndices={answeredIndices}
                reviewIndices={reviewIndices}
                onSelect={scrollToQuestion}
                onToggleReview={handleToggleReview}
                onNext={() => scrollToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                onPrev={() => scrollToQuestion(Math.max(0, currentIndex - 1))}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
              />
            </div>
          )}
        </div>
      </AntiCheatGuard>
    </ProtectedRoute>
  );
}
