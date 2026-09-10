'use client';

import React, { useState, useEffect, useEffectEvent, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { utcTime } from '@/lib/exam';

interface ExamHeaderProps {
  testTitle: string;
  durationMinutes: number;
  onTimeUp: () => void;
  isCompleted?: boolean;
  storageKey?: string;
  deadlineAt?: string;
  onFontChange?: (size: 'normal' | 'large' | 'xlarge') => void;
  onContrastChange?: (contrast: 'standard' | 'high-contrast') => void;
}

export default function ExamHeader({
  testTitle,
  durationMinutes,
  onTimeUp,
  isCompleted = false,
  deadlineAt,
  onFontChange,
  onContrastChange,
}: ExamHeaderProps) {
  const { user } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const expired = useRef(false);
  const expire = useEffectEvent(() => onTimeUp());

  const [showTime, setShowTime] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [contrast, setContrast] = useState<'standard' | 'high-contrast'>('standard');
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    if (isCompleted || !deadlineAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((utcTime(deadlineAt) - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0 && !expired.current) { expired.current = true; expire(); }
    };
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [isCompleted, deadlineAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLowTime = secondsLeft <= 300; // < 5 min warning
  const isVeryLow = secondsLeft <= 600; // < 10 min - IELTS prevents hiding time

  const toggleFontSize = () => {
    const next = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal';
    setFontSize(next);
    onFontChange?.(next);
  };

  const toggleContrast = () => {
    const next = contrast === 'standard' ? 'high-contrast' : 'standard';
    setContrast(next);
    onContrastChange?.(next);
  };

  return (
    <>
      <header className={`w-full transition-colors border-b px-4 py-2.5 flex items-center justify-between select-none ${
        contrast === 'high-contrast' 
          ? 'bg-black text-yellow-400 border-yellow-500' 
          : 'bg-[#002e5b] text-white border-blue-900 shadow-sm'
      }`}>
        {/* Chap tomon: Nomzod ma'lumotlari */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-sm text-white">
            {user?.full_name?.charAt(0) || 'C'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              {user?.full_name || 'IELTS Candidate'}
            </p>
            <p className="text-[11px] text-gray-300">
              ID: <span className="font-mono font-medium">UZ-{user?.id ? String(user.id).padStart(6, '0') : '084201'}</span> | {testTitle}
            </p>
          </div>
        </div>

        {/* O'rta: Taymer */}
        {!isCompleted && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-base transition-all ${
              isLowTime 
                ? 'bg-red-600 text-white animate-pulse' 
                : contrast === 'high-contrast'
                ? 'bg-yellow-400 text-black'
                : 'bg-white/15 text-white'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {showTime 
                  ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` 
                  : 'Time Remaining'}
              </span>
            </div>

            {/* Vaqtni yashirish (10 daqiqadan kam qolganda IELTS qoidasiga ko'ra yashirib bo'lmaydi) */}
            <button
              onClick={() => {
                if (isVeryLow) {
                  alert("IELTS qoidasi: Imtihon tugashiga 10 daqiqadan kam vaqt qolganda taymerni yashirib bo'lmaydi.");
                  return;
                }
                setShowTime(!showTime);
              }}
              title={showTime ? "Vaqtni yashirish" : "Vaqtni ko'rsatish"}
              className="text-xs text-blue-200 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition hidden md:block"
            >
              {showTime ? 'Hide time' : 'Show time'}
            </button>
          </div>
        )}

        {/* O'ng tomon: Qulaylik sozlamalari va Yordam */}
        <div className="flex items-center space-x-1.5">
          {/* Shrift o'lchami */}
          <button
            onClick={toggleFontSize}
            title="Shrift hajmini o'zgartirish"
            className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition flex items-center space-x-1"
          >
            <span className="font-bold">A</span>
            <span className="text-[10px] uppercase font-mono">{fontSize}</span>
          </button>

          {/* Kontrast */}
          <button
            onClick={toggleContrast}
            title="Yuqori kontrast rejimi"
            className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition flex items-center space-x-1"
          >
            <span className="text-xs">🌓</span>
          </button>

          {/* Yordam */}
          <button
            onClick={() => setShowHelpModal(true)}
            title="Imtihon qoidalari va yordam"
            className="px-2.5 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition font-medium"
          >
            Help
          </button>
        </div>
      </header>

      {/* Yordam Modali */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>📘</span>
                <span>Computer-Delivered IELTS Qo&apos;llanmasi</span>
              </h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong>1. Navigatsiya:</strong> Pastdagi savollar qatori orqali istalgan savolga to&apos;g&apos;ridan-to&apos;g&apos;ri o&apos;tishingiz mumkin.
              </p>
              <p>
                <strong>2. Review (Ko&apos;rib chiqish):</strong> Shubhali savollarga bayroqcha qo&apos;yish uchun &quot;Review&quot; belgisini bosing.
              </p>
              <p>
                <strong>3. Highlight (Belgilash):</strong> Matndagi muhim jumlalarni sichqoncha bilan belgilab, sariq rang bilan ajratishingiz mumkin.
              </p>
              <p>
                <strong>4. Anti-cheat Nazorati:</strong> Imtihon davomida ekrandan chiqish, tab almashtirish yoki nusxa olish qat&apos;iyan man etiladi.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
            >
              Tushundim, davom etish
            </button>
          </div>
        </div>
      )}
    </>
  );
}
