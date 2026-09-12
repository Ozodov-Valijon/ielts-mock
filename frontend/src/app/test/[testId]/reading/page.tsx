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
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExamError from '@/components/ExamError';
import { useExamSession, nextExamRoute, readDraft, saveDraft, clearDraft } from '@/lib/exam';

export default function ReadingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = String(params.testId);
  const session = useExamSession(testId, 'reading');
  const setNumber = session.test?.set_number || 1;
  const [loadError, setLoadError] = useState('');

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
  const questionsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!session.ready) return;
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await api.getReadingQuestions(testId);
        if (!data.length) throw new Error('Bu to‘plamda Reading savollari mavjud emas.');
        setQuestions(data);
        setAnswers(readDraft(`ielts_answers_${testId}_reading`, {}));
      } catch (err: unknown) {
        console.error("Savollarni yuklashda xatolik:", err);
        setLoadError(err instanceof Error ? err.message : 'Savollar yuklanmadi');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [testId, session.ready]);

  const handleAnswerChange = (questionId: number, value: string) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    saveDraft(`ielts_answers_${testId}_reading`, updated);
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
    const targetEl = questionRefs.current[index];
    const container = questionsContainerRef.current;
    if (targetEl && container) {
      const containerTop = container.getBoundingClientRect().top;
      const targetTop = targetEl.getBoundingClientRect().top;
      const scrollOffset = targetTop - containerTop + container.scrollTop - 16;
      container.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' });
    } else if (targetEl) {
      const yOffset = -80;
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (submitting || resultScore !== null || !questions.length) return;
    setSubmitting(true);
    try {
      const payload = questions.map(q => ({
        question_id: q.id,
        user_answer: answers[q.id] || ''
      }));
      const res = await api.submitReadingAnswers(testId, payload);
      setResultScore(res.score);
      clearDraft(`ielts_answers_${testId}_reading`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      console.error(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    if (session.test) router.push(nextExamRoute(session.test, 'reading'));
  };

  if (session.error || loadError) return <ProtectedRoute><ExamError message={session.error || loadError} /></ProtectedRoute>;
  if (loading || !session.ready) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  // Qaysi savollarga javob berilganligini hisoblash
  const answeredIndices = new Set(
    questions.map((q, idx) => (answers[q.id] && answers[q.id].trim() !== '' ? idx : -1)).filter(idx => idx !== -1)
  );

  const fontClass = fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId} active={resultScore === null}>
        <div className={`h-screen flex flex-col overflow-hidden ${contrast === 'high-contrast' ? 'bg-black text-yellow-300' : 'bg-[#f8fafc] text-gray-900'}`}>
          {/* Rasmiy Cambridge Imtihon Headeri */}
          <div className="shrink-0">
            <ExamHeader
              testTitle={`Academic Reading — Set #${setNumber}`}
              durationMinutes={60}
              deadlineAt={session.state?.deadline_at}
              onTimeUp={handleSubmit}
              isCompleted={resultScore !== null}
              storageKey={`ielts_timer_${testId}_reading`}
              onFontChange={setFontSize}
              onContrastChange={setContrast}
            />
          </div>

          {/* Asosiy Ish Maydoni (Split Screen) */}
          <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-3 sm:p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Chap tomon: Reading Passage (Matnni ajratish va eslatma qoldirish imkoniyati bilan) */}
            <section aria-label="Reading Passage" className={`w-full md:w-1/2 rounded-xl border p-5 sm:p-7 overflow-y-auto h-full shadow-xs ${
              contrast === 'high-contrast' ? 'bg-gray-950 border-yellow-500' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
                <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Reading Passage
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {questions.length} ta savol
                </span>
              </div>

              <TextHighlighter
                content={questions[currentIndex]?.passage_text || questions[0]?.passage_text || 'Matn mavjud emas'}
                className={`${fontClass} leading-relaxed whitespace-pre-wrap`}
              />
            </section>

            {/* O'ng tomon: Savollar bloki */}
            <section aria-label="Savollar" className="w-full md:w-1/2 flex flex-col h-full min-h-0">
              <div ref={questionsContainerRef} className={`flex-1 rounded-xl border p-4 sm:p-6 overflow-y-auto ${
                contrast === 'high-contrast' ? 'bg-gray-950 border-yellow-500' : 'bg-white border-gray-200 shadow-xs'
              }`}>
                {resultScore !== null ? (
                  <div className="p-8 rounded-xl border border-gray-200 text-center my-auto bg-white shadow-xs max-w-md mx-auto">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                      Bo&apos;lim yakunlandi
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Reading natijasi</h3>
                    <div className="text-5xl font-black text-blue-700 my-3">{resultScore.toFixed(1)}</div>
                    <p className="text-xs text-gray-500 mb-6">Band Score</p>
                    <button
                      onClick={handleProceed}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm cursor-pointer"
                    >
                      {session.test?.test_mode === 'full' ? 'Listening bo‘limiga o‘tish' : 'Natijalarni ko‘rish'} &rarr;
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
            <div className="shrink-0 z-30">
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
