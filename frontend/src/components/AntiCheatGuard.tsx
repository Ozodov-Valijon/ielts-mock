'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

interface AntiCheatGuardProps {
  testId: string | number;
  children: React.ReactNode;
  allowPaste?: boolean;
  requireFullscreen?: boolean;
}

export default function AntiCheatGuard({ 
  testId, 
  children, 
  allowPaste = false,
  requireFullscreen = true 
}: AntiCheatGuardProps) {
  const [warnings, setWarnings] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);
  
  // Fullscreen nazorati
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false);
  const hasEnteredOnceRef = useRef(false);
  const lastEventTimeRef = useRef<number>(0);

  const reportEvent = useCallback(async (eventType: 'tab_switch' | 'paste_attempt' | 'fullscreen_exit', message: string) => {
    const now = Date.now();
    if ((eventType === 'tab_switch' || eventType === 'fullscreen_exit') && now - lastEventTimeRef.current < 1500) {
      return;
    }
    lastEventTimeRef.current = now;

    try {
      const res = await api.logAntiCheatEvent(testId, eventType, message);
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

  // To'liq ekranga o'tish funksiyasi
  const enterFullscreen = async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      setIsFullscreen(true);
      setHasEnteredOnce(true);
      hasEnteredOnceRef.current = true;
    } catch (err) {
      console.warn("Fullscreen ochishda brauzer cheklovi:", err);
      // Brauzer to'liq ruxsat bermasa ham interfeysni ochish
      setIsFullscreen(true);
      setHasEnteredOnce(true);
      hasEnteredOnceRef.current = true;
    }
  };

  // 1. Fullscreen o'zgarishlarini kuzatish
  useEffect(() => {
    if (!requireFullscreen) {
      setIsFullscreen(true);
      return;
    }

    const checkFullscreenStatus = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isFull);

      // Agar oldin to'liq ekranda bo'lib, keyin chiqib ketgan bo'lsa -> Qoidabuzarlik!
      if (!isFull && hasEnteredOnceRef.current) {
        reportEvent(
          'fullscreen_exit', 
          "Siz to'liq ekran (Fullscreen) rejimidan chiqdingiz! IELTS Mock imtihonida boshqa oynalarga o'tmaslik uchun faqat to'liq ekran ruxsat etiladi."
        );
      }
    };

    // Boshlang'ich tekshirish
    checkFullscreenStatus();

    document.addEventListener('fullscreenchange', checkFullscreenStatus);
    document.addEventListener('webkitfullscreenchange', checkFullscreenStatus);
    document.addEventListener('mozfullscreenchange', checkFullscreenStatus);
    document.addEventListener('MSFullscreenChange', checkFullscreenStatus);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreenStatus);
      document.removeEventListener('webkitfullscreenchange', checkFullscreenStatus);
      document.removeEventListener('mozfullscreenchange', checkFullscreenStatus);
      document.removeEventListener('MSFullscreenChange', checkFullscreenStatus);
    };
  }, [requireFullscreen, reportEvent]);

  // 2. Sahifani tasodifan yopish yoki yangilashni to'xtatish (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Imtihon davom etmoqda. Sahifadan chiqib ketish natijangiz bekor bo'lishiga olib kelishi mumkin!";
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 3. Tab switch va Window blur nazorati
  useEffect(() => {
    let timeoutId: any = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportEvent(
          'tab_switch', 
          "Siz test sahifasidan chiqib boshqa vkladka yoki dasturga o'tdingiz. IELTS Mock testida tashqi manbalardan foydalanish qat'iyan taqiqlanadi!"
        );
      }
    };

    const handleBlur = () => {
      timeoutId = setTimeout(() => {
        if (!document.hasFocus()) {
          reportEvent(
            'tab_switch', 
            "Brauzer oynasidan tashqariga chiqildi. Test paytida boshqa dasturlarni ochish taqiqlanadi!"
          );
        }
      }, 500);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [reportEvent]);

  // 4. Klaviatura va sichqoncha xavfsizligi (DevTools, Paste, Copy bloklash)
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

      // Ctrl + Shift + I/J/C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return;
      }

      // Ctrl + U (View source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return;
      }

      // Ctrl + C (Nusxa ko'chirish - faqat input/textarea bo'lmasa bloklanadi)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c')) {
        const target = e.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        if (!isInputField) {
          e.preventDefault();
          setModalMessage("Test materiallaridan nusxa ko'chirish (Copy) qat'iyan taqiqlangan!");
          setShowModal(true);
          return;
        }
      }

      // Ctrl + V (Paste)
      if (!allowPaste && (e.ctrlKey || e.metaKey) && (e.key === 'V' || e.key === 'v')) {
        e.preventDefault();
        reportEvent('paste_attempt', "Tashqaridan matn nusxasini tashlash (Paste) taqiqlanadi! Inshoni klaviaturada o'zingiz yozing.");
        return;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (!isInputField) {
        e.preventDefault();
        setModalMessage("Test matnini nusxalash (Copy) taqiqlanadi!");
        setShowModal(true);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!allowPaste) {
        e.preventDefault();
        reportEvent('paste_attempt', "Tashqaridan matn nusxasini tashlash (Paste) taqiqlanadi! Inshoni klaviaturada o'zingiz yozing.");
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
      {/* 🔒 Majburiy To'liq Ekran (Fullscreen) Bloklash Pardasi */}
      {requireFullscreen && !isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center select-none backdrop-blur-xl">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-blue-500/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="w-24 h-24 bg-blue-500/10 text-blue-400 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 border border-blue-500/20 shadow-inner">
              🖥️
            </div>
            
            <span className="bg-blue-500/20 text-blue-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 inline-block border border-blue-500/30">
              Anti-Cheat Himoyalangan Muhit
            </span>
            
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
              {hasEnteredOnce 
                ? "Diqqat: To'liq Ekrandan Chiqildi!" 
                : "To'liq Ekran (Fullscreen) Rejimi"}
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
              {hasEnteredOnce ? (
                <>
                  Siz to&apos;liq ekran rejimidan chiqdingiz. Rasmiy IELTS Mock talabiga ko&apos;ra, boshqa dasturlar yoki oynalarga o&apos;tmaslik uchun test faqat <strong>to&apos;liq ekranda</strong> davom ettiriladi.
                </>
              ) : (
                <>
                  Rasmiy IELTS Mock qoidalariga ko&apos;ra, imtihon paytida xavfsizlikni ta&apos;minlash va chalg&apos;imaslik uchun test <strong>to&apos;liq ekran</strong> rejimida o&apos;tkaziladi. Oynadan chiqib ketish taqiqlanadi.
                </>
              )}
            </p>

            {warnings > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl p-3 mb-6">
                Qayd etilgan qoidabuzarliklar: <span className="text-sm font-black">{warnings} / 3</span>
              </div>
            )}

            <button
              onClick={enterFullscreen}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold py-4 px-6 rounded-2xl transition transform hover:scale-[1.02] shadow-2xl text-lg flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="text-2xl">{hasEnteredOnce ? "🔄" : "🚀"}</span>
              <span>{hasEnteredOnce ? "To'liq Ekranga Qaytish va Davom Etish" : "To'liq Ekranga O'tish va Boshlash"}</span>
            </button>

            <p className="text-slate-400 text-xs mt-5">
              Esc yoki boshqa vkladkaga o&apos;tish avtomatik qoidabuzarlik deb hisoblanadi.
            </p>
          </div>
        </div>
      )}

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
                  ⚠️ 3 ta ogohlantirish to&apos;ldi! Testingiz chiterlik shubhasi bilan mentorga yuborildi.
                </span>
              ) : (
                <span className="text-gray-600 mt-1 block">
                  Eslatma: 3 ta qoidabuzarlikdan so&apos;ng test natijangiz bekor qilinadi.
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                if (requireFullscreen && !isFullscreen) {
                  enterFullscreen();
                }
              }}
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
