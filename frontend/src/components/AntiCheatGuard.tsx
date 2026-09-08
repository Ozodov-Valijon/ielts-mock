'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface AntiCheatGuardProps {
  testId: string | number;
  children: React.ReactNode;
  allowPaste?: boolean;
}

export default function AntiCheatGuard({ testId, children, allowPaste = false }: AntiCheatGuardProps) {
  const [warnings, setWarnings] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);

  const reportEvent = useCallback(async (eventType: 'tab_switch' | 'paste_attempt', message: string) => {
    try {
      const res = await api.logAntiCheatEvent(testId, eventType);
      const newWarnings = (res.tab_switches || 0) + (res.paste_attempts || 0);
      setWarnings(newWarnings);
      if (res.is_flagged_cheating) {
        setIsFlagged(true);
      }
      setModalMessage(message);
      setShowModal(true);
    } catch (err) {
      console.error("Anti-cheat hodisasini yuborishda xatolik:", err);
    }
  }, [testId]);

  // 1. Tab switch va Window blur nazorati
  useEffect(() => {
    let timeoutId: any = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportEvent('tab_switch', "Siz test sahifasidan chiqib boshqa tab yoki ilovaga o'tdingiz. IELTS Mock testida tashqi manbalardan foydalanish qat'iyan taqiqlanadi!");
      }
    };

    const handleBlur = () => {
      // 500ms kutib tekshiramiz (kichik fokus almashishlarini filtrlash uchun)
      timeoutId = setTimeout(() => {
        if (!document.hasFocus()) {
          reportEvent('tab_switch', "Brauzer oynasidan tashqariga chiqildi. Test paytida boshqa dasturlarni ochish taqiqlanadi!");
        }
      }, 400);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [reportEvent]);

  // 2. Klaviatura va sichqoncha xavfsizligi
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Ctrl + Shift + I (DevTools) yoki Ctrl + Shift + J
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return;
      }

      // Ctrl + U (View source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return;
      }

      // Ctrl + C (Nusxa ko'chirish)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        alert("Matndan nusxa ko'chirish (Copy) taqiqlangan!");
        return;
      }

      // Ctrl + V (Paste)
      if (!allowPaste && (e.ctrlKey || e.metaKey) && (e.key === 'V' || e.key === 'v')) {
        e.preventDefault();
        reportEvent('paste_attempt', "Tashqaridan matn nusxasini tashlash (Paste) taqiqlanadi! Inshoni o'zingiz yozing.");
        return;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Test matnini nusxalash (Copy) taqiqlanadi!");
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!allowPaste) {
        e.preventDefault();
        reportEvent('paste_attempt', "Tashqaridan matn nusxasini tashlash (Paste) taqiqlanadi! Inshoni o'zingiz yozing.");
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
    };
  }, [allowPaste, reportEvent]);

  return (
    <div className="relative select-none">
      {/* Yuqori o'ng burchakdagi Anti-Cheat status nishoni */}
      <div className="fixed top-20 right-4 z-40 bg-white/95 backdrop-blur border border-gray-200 shadow-md rounded-full px-4 py-1.5 flex items-center space-x-2 text-xs font-bold">
        <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isFlagged ? 'bg-red-600' : warnings > 0 ? 'bg-orange-500' : 'bg-green-500'}`}></span>
        <span className="text-gray-700">Anti-Cheat Himoyasi</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          isFlagged 
            ? 'bg-red-100 text-red-700 font-extrabold' 
            : warnings > 0 
            ? 'bg-orange-100 text-orange-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {isFlagged ? 'XAVF: BELGILANGAN ⚠️' : `${warnings}/3 OGOHLANTIRISH`}
        </span>
      </div>

      {/* Asosiy kontent */}
      {children}

      {/* Qat'iy Ogohlantirish Modali */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-center shadow-2xl border-4 border-red-500 animate-bounce-short">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-black">
              🚨
            </div>
            <h2 className="text-2xl font-black text-red-600 mb-2 tracking-tight uppercase">
              Qoidabuzarlik Qayd Etildi!
            </h2>
            <p className="text-gray-700 text-sm mb-4 leading-relaxed font-medium">
              {modalMessage}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-xs text-red-800 font-bold">
              Ogohlantirish holati: <span className="text-base text-red-700">{warnings} / 3</span><br />
              {warnings >= 3 ? (
                <span className="text-red-900 mt-1 block uppercase">
                  ⚠️ 3 ta ogohlantirish to'ldi! Testingiz chiterlik shubhasi bilan mentorga yuborildi.
                </span>
              ) : (
                <span className="text-gray-600 mt-1 block">
                  Eslatma: 3 ta qoidabuzarlikdan so'ng test natijangiz bekor qilinadi.
                </span>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg"
            >
              Qoidalarni Tushundim, Testga Qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
