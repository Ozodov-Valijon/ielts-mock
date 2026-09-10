'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AntiCheatGuard from '@/components/AntiCheatGuard';
import ExamHeader from '@/components/ExamHeader';
import QuestionPalette from '@/components/QuestionPalette';
import QuestionCard from '@/components/QuestionCard';
import AudioPlayer from '@/components/AudioPlayer';
import { api } from '@/lib/api';
import { Question } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExamError from '@/components/ExamError';
import { useExamSession, nextExamRoute, readDraft, saveDraft, clearDraft } from '@/lib/exam';

export default function ListeningTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = String(params.testId);
  const session = useExamSession(testId, 'listening');
  const setNumber = session.test?.set_number || 1;
  const [loadError, setLoadError] = useState('');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [resultScore, setResultScore] = useState<number | null>(null);

  // Cambridge Navigatsiya & Sozlamalar
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewIndices, setReviewIndices] = useState<Set<number>>(new Set());
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [contrast, setContrast] = useState<'standard' | 'high-contrast'>('standard');
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!session.ready) return;
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await api.getListeningQuestions(testId);
        if (!data.length || !data[0].audio_url) throw new Error('Listening savollari yoki audio mavjud emas. Admin to‘plamni tayyorlashi kerak.');
        setQuestions(data);
        setAudioUrl(data[0].audio_url);
        setAnswers(readDraft(`ielts_answers_${testId}_listening`, {}));
      } catch (err: unknown) {
        console.error("Listening savollarini yuklashda xatolik:", err);
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
    saveDraft(`ielts_answers_${testId}_listening`, updated);
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
    if (targetEl) {
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
      const res = await api.submitListeningAnswers(testId, payload);
      setResultScore(res.score);
      clearDraft(`ielts_answers_${testId}_listening`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Xatolik yuz berdi';
      console.error(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    if (session.test) router.push(nextExamRoute(session.test, 'listening'));
  };

  if (session.error || loadError) return <ProtectedRoute><ExamError message={session.error || loadError} /></ProtectedRoute>;
  if (loading || !session.ready) return <ProtectedRoute><LoadingSpinner /></ProtectedRoute>;

  const answeredIndices = new Set(
    questions.map((q, idx) => (answers[q.id] && answers[q.id].trim() !== '' ? idx : -1)).filter(idx => idx !== -1)
  );

  return (
    <ProtectedRoute>
      <AntiCheatGuard testId={testId}>
        <div className={`min-h-screen flex flex-col ${contrast === 'high-contrast' ? 'bg-black text-yellow-300' : 'bg-[#f8fafc] text-gray-900'}`}>
          {/* Rasmiy Cambridge Imtihon Headeri */}
          <ExamHeader
            testTitle={`Academic Listening — Set #${setNumber}`}
            durationMinutes={30}
            deadlineAt={session.state?.deadline_at}
            onTimeUp={handleSubmit}
            isCompleted={resultScore !== null}
            storageKey={`ielts_timer_${testId}_listening`}
            onFontChange={setFontSize}
            onContrastChange={setContrast}
          />

          {/* Asosiy Ish Maydoni */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
            {/* Listening Audio Pleyer Paneli */}
            <section aria-label="Listening Audio Pleyer" className={`p-5 rounded-2xl border shadow-xs ${
              contrast === 'high-contrast' ? 'bg-gray-950 border-yellow-500' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3 border-b pb-2 border-gray-200">
                <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Listening Audio Track
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Audio faqat 1 marta ijro etiladi
                </span>
              </div>
              {audioUrl && resultScore === null && <AudioPlayer src={audioUrl} allowReplay={false} startedAt={session.state?.audio_started_at} onFirstPlay={() => api.startListeningAudio(testId)} />}
            </section>

            {/* Savollar Bloki */}
            <section aria-label="Savollar" className={`rounded-2xl border p-6 shadow-xs flex-1 ${
              fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm'
            } ${
              contrast === 'high-contrast' ? 'bg-gray-950 border-yellow-500' : 'bg-white border-gray-200'
            }`}>
              {resultScore !== null ? (
                <div className="p-8 rounded-2xl border border-green-200 text-center my-auto bg-green-50/50">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-4">
                    ✓
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Listening Muvaffaqiyatli Yakunlandi!</h3>
                  <p className="text-gray-600 mb-4">Ushbu mashq bo&apos;yicha taxminiy band:</p>
                  <div className="text-6xl font-black text-blue-700 mb-6">{resultScore.toFixed(1)}</div>
                  <button
                    onClick={handleProceed}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform hover:scale-105"
                  >
                    {session.test?.test_mode === 'full' ? 'Keyingi: Writing' : 'Natijalarni ko‘rish'} &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b pb-3 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-800">
                      Savollar (1 &ndash; {questions.length})
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">Audioni tinglab, to&apos;g&apos;ri javobni tanlang</span>
                  </div>

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
