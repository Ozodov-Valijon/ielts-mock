'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface AntiCheatGuardProps {
  testId: string | number;
  children: React.ReactNode;
  allowPaste?: boolean;
  requireFullscreen?: boolean;
  active?: boolean;
}

export default function AntiCheatGuard({ 
  testId, 
  children, 
  allowPaste = false,
  requireFullscreen = true,
  active = true
}: AntiCheatGuardProps) {
  const router = useRouter();
  const [warnings, setWarnings] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationCountdown, setTerminationCountdown] = useState(3);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Helper: check and mark exam active in sessionStorage
  const isExamActive = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(`ielts_exam_active_${testId}`) === 'true';
  }, [testId]);

  const markExamActive = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`ielts_exam_active_${testId}`, 'true');
  }, [testId]);
  
  // Fullscreen nazorati
  const [isFullscreen, setIsFullscreen] = useState(!requireFullscreen);
  const [fullscreenError, setFullscreenError] = useState('');
  const [hasEnteredOnce, setHasEnteredOnce] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`ielts_exam_active_${testId}`) === 'true';
    }
    return false;
  });
  const hasEnteredOnceRef = useRef(hasEnteredOnce);

  const markEntered = useCallback(() => {
    setHasEnteredOnce(true);
    hasEnteredOnceRef.current = true;
    markExamActive();
  }, [markExamActive]);
  const lastEventTimeRef = useRef<number>(0);

  // Katta CHITER signali va ovozi
  const [showCheaterAlarm, setShowCheaterAlarm] = useState(false);
  const [cheaterMessage, setCheaterMessage] = useState('');
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ovozli ogohlantirish signali (Web Audio API)
  const playAlertTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      osc.onended = () => { void ctx.close(); };
    } catch (e) {
      console.warn("Alert audio xatoligi:", e);
    }
  }, []);

  // Ovozli ogohlantirish (SpeechSynthesis orqali)
  const speakCheater = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Qoidabuzarlik qayd etildi. Iltimos, testga qayting.");
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis xatoligi:", e);
    }
  }, []);

  // Ovozli test yakunlanganlik xabari
  const speakTermination = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Qoidabuzarliklar soni chegaradan oshdi. Test yakunlandi.");
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis xatoligi:", e);
    }
  }, []);

  // Backend bilan test holatini sinxronlashtirish
  useEffect(() => {
    let isMounted = true;
    async function syncTestStatus() {
      try {
        const test = await api.getTestDetails(testId);
        if (!isMounted) return;
        const totalViolations = (test.tab_switches || 0) + (test.paste_attempts || 0);
        setWarnings(totalViolations);
        if (test.is_flagged_cheating || totalViolations >= 3 || test.status === 'terminated') {
          setIsTerminated(true);
          speakTermination();
        }
      } catch (e) {
        console.warn("Test holatini tekshirishda xatolik:", e);
      }
    }
    syncTestStatus();
    return () => { isMounted = false; };
  }, [testId, speakTermination]);

  // Lockout countdown taymeri
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Ogohlantirishni ishga tushirish funksiyasi
  const triggerAlarm = useCallback((message: string) => {
    setCheaterMessage(message);
    setShowCheaterAlarm(true);
    setLockoutSeconds(5);
    playAlertTone();
    speakCheater();
  }, [playAlertTone, speakCheater]);

  // Alarmni to'xtatish
  const stopAlarm = useCallback(() => {
    setShowCheaterAlarm(false);
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  }, []);

  // Backend ga hodisani yuborish
  const reportEvent = useCallback(async (eventType: 'tab_switch' | 'paste_attempt' | 'fullscreen_exit', message: string) => {
    if (!active) return;
    const now = Date.now();
    if ((eventType === 'tab_switch' || eventType === 'fullscreen_exit') && now - lastEventTimeRef.current < 1500) {
      return;
    }
    lastEventTimeRef.current = now;

    // Alarm va Ovozni darhol chalish!
    triggerAlarm(message);

    try {
      const res = await api.logAntiCheatEvent(testId, eventType, message);
      const newWarnings = (res.tab_switches || 0) + (res.paste_attempts || 0);
      setWarnings(newWarnings);
      
      // Agar 2 martadan oshib ketsa (3-marta) -> test avtomatik ravishda yakunlanadi!
      if (res.is_flagged_cheating || newWarnings > 2 || (res as { auto_terminated?: boolean }).auto_terminated) {
        setIsTerminated(true);
        setShowCheaterAlarm(false);
        if (soundIntervalRef.current) {
          clearInterval(soundIntervalRef.current);
          soundIntervalRef.current = null;
        }
        playAlertTone();
        speakTermination();
      }
    } catch (err) {
      console.error("Anti-cheat hodisasini yuborishda xatolik:", err);
    }
  }, [active, testId, triggerAlarm, playAlertTone, speakTermination]);

  // 🛑 Test bekor qilinganda 3 soniyadan keyin natijalar sahifasiga yo'naltirish
  useEffect(() => {
    if (!isTerminated) return;

    const timer = setInterval(() => {
      setTerminationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/test/${testId}/results`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTerminated, router, testId]);

  // To'liq ekranga o'tish funksiyasi
  const enterFullscreen = async () => {
    setFullscreenError('');
    try {
      interface ExtendedElement extends HTMLElement {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      }
      const docEl = document.documentElement as ExtendedElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      } else {
        throw new Error('Bu brauzer to‘liq ekran rejimini qo‘llamaydi. Kompyuterda Chrome yoki Edge orqali oching.');
      }
      const fullDocument = document as Document & { webkitFullscreenElement?: Element; mozFullScreenElement?: Element; msFullscreenElement?: Element };
      if (!(document.fullscreenElement || fullDocument.webkitFullscreenElement || fullDocument.mozFullScreenElement || fullDocument.msFullscreenElement)) throw new Error('To‘liq ekran ochilmadi. Ruxsatni tekshirib qayta urinib ko‘ring.');
      setIsFullscreen(true);
      markEntered();
      stopAlarm();
    } catch (err) {
      console.warn("Fullscreen ochishda brauzer cheklovi:", err);
      setIsFullscreen(false);
      setFullscreenError(err instanceof Error ? err.message : 'To‘liq ekran ochilmadi.');
    }
  };

  // 1. Sahifa ochilganda avtomatik to'liq ekranga o'tishga urinish
  useEffect(() => {
    const tryAutoFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
          markEntered();
        }
      } catch {
        // Agar foydalanuvchi tugmani bosmagan bo'lsa brauzer bloklashi mumkin (overlay ochiladi)
      }
    };
    tryAutoFullscreen();
  }, [markEntered]);

  // 2. Fullscreen o'zgarishlarini kuzatish
  useEffect(() => {
    if (!requireFullscreen) {
      return;
    }

    const checkFullscreenStatus = () => {
      interface ExtendedDocument extends Document {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
      }
      const doc = document as ExtendedDocument;
      const isFull = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      setIsFullscreen(isFull);

      const active = isExamActive();

      if (isFull) {
        markEntered();
        stopAlarm();
      } else if (!isFull && (hasEnteredOnceRef.current || active)) {
        // Agar imtihon boshlangan bo'lsa va to'liq ekrandan chiqilsa:
        // HECH QANDAY KOD YOKI TUGMA BILAN QOCHIB BO'LMAYDI! DARHOL QOIDABUZARLIK QAYD ETILADI!
        reportEvent(
          'fullscreen_exit', 
          "Siz to'liq ekran (Fullscreen) rejimidan chiqdingiz! IELTS Mock imtihonida oynadan chiqish qat'iyan taqiqlanadi!"
        );
      }
    };

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
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
    };
  }, [requireFullscreen, reportEvent, stopAlarm, isExamActive, markEntered]);

  // 3. Sahifadan chiqishni oldini olish (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Imtihon davom etmoqda. Sahifadan chiqib ketish natijangiz bekor bo'lishiga olib kelishi mumkin!";
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 4. Tab switch va Window blur nazorati (Boshqa oynaga o'tsa CHITER signali chaladi)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportEvent(
          'tab_switch', 
          "Siz test sahifasidan chiqib boshqa vkladka yoki dasturga o'tdingiz! IELTS Mock testida boshqa manbalarga o'tish taqiqlanadi!"
        );
      }
    };

    const handleBlur = () => {
      timeoutId = setTimeout(() => {
        if (!document.hasFocus()) {
          reportEvent(
            'tab_switch', 
            "Brauzer oynasidan tashqariga chiqildi! Test paytida boshqa dasturlarni ochish taqiqlanadi!"
          );
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

  // 5. DevTools va Nusxa ko'chirishni taqiqlash
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        triggerAlarm("Tizim manbasini tekshirish (F12 DevTools) qat'iyan taqiqlangan!");
        return;
      }

      // Ctrl + Shift + I/J/C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerAlarm("Dastur kodlarini ochish (Inspect) taqiqlanadi!");
        return;
      }

      // Ctrl + U (View source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        triggerAlarm("Sahifa manbasini ko'rish taqiqlanadi!");
        return;
      }

      // Ctrl + C (Copy)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c')) {
        const target = e.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        if (!isInputField) {
          e.preventDefault();
          triggerAlarm("Test materiallaridan nusxa ko'chirish (Copy) taqiqlangan!");
          return;
        }
      }

      // Ctrl + V (Paste)
      if (!allowPaste && (e.ctrlKey || e.metaKey) && (e.key === 'V' || e.key === 'v')) {
        e.preventDefault();
        reportEvent('paste_attempt', "Tashqaridan matn nusxasini qo'yish (Paste) taqiqlanadi! Inshoni o'zingiz yozing.");
        return;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (!isInputField) {
        e.preventDefault();
        triggerAlarm("Test matnidan nusxa ko'chirish taqiqlanadi!");
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!allowPaste) {
        e.preventDefault();
        reportEvent('paste_attempt', "Tashqaridan matn qo'yish (Paste) taqiqlanadi!");
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
  }, [allowPaste, reportEvent, triggerAlarm]);

  if (!active) return <>{children}</>;

  return (
    <div className="relative select-none">
      {fullscreenError && <p role="alert" className="fixed top-4 left-4 right-4 z-[30000] bg-red-100 text-red-900 p-4 rounded-xl text-center">{fullscreenError}</p>}
      {/* Test qoidabuzarlik tufayli yakunlanganda */}
      {isTerminated && (
        <div className="fixed inset-0 z-[20000] bg-black/95 flex flex-col items-center justify-center p-4 text-center select-none backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-wide">
              Test to&apos;xtatildi
            </h2>
            <p className="text-sm text-gray-300 mt-3 mb-5 leading-relaxed">
              Ruxsat etilgan ogohlantirishlar limiti oshib ketgani sababli imtihon avtomatik yakunlandi.
            </p>
            <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-3 mb-5 text-sm text-red-300 font-medium">
              Qoidabuzarliklar soni: {warnings} / 2
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Natijalar sahifasiga o&apos;tilmoqda: <span className="text-white font-mono font-bold">{terminationCountdown}</span> soniya...
            </p>
            <button
              onClick={() => router.push(`/test/${testId}/results`)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm cursor-pointer"
            >
              Natijalar sahifasiga o&apos;tish &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Qoidabuzarlik ogohlantirish oynasi */}
      {showCheaterAlarm && !isTerminated && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-center p-4 text-center select-none backdrop-blur-md animate-in fade-in">
          <div className="max-w-lg w-full bg-slate-900 border border-red-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-400">
              Qoidabuzarlik qayd etildi
            </h2>
            <p className="text-sm text-gray-300 mt-2 mb-5 leading-relaxed">
              {cheaterMessage || "Imtihon qoidalariga ko'ra boshqa oynaga o'tish yoki to'liq ekrandan chiqish taqiqlanadi."}
            </p>
            <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4 mb-6">
              <span className="text-xs text-gray-400 block mb-1">Ogohlantirish darajasi:</span>
              <span className="text-2xl font-black text-white font-mono">{warnings} / 2</span>
              {warnings === 1 && (
                <span className="block text-yellow-400 text-xs font-semibold mt-1">
                  1-ogohlantirish. Yana 1 ta qoidabuzarlikdan so&apos;ng test yakunlanadi.
                </span>
              )}
              {warnings >= 2 && (
                <span className="block text-red-400 text-xs font-semibold mt-1">
                  Oxirgi ogohlantirish. Keyingi qoidabuzarlikda test darhol to&apos;xtatiladi.
                </span>
              )}
            </div>
            <button
              onClick={enterFullscreen}
              disabled={lockoutSeconds > 0}
              className={`w-full text-white font-bold py-3 px-6 rounded-xl transition text-sm ${
                lockoutSeconds > 0
                  ? 'bg-slate-800 text-gray-400 cursor-not-allowed border border-gray-700'
                  : 'bg-red-600 hover:bg-red-700 cursor-pointer'
              }`}
            >
              {lockoutSeconds > 0
                ? `Qaytish kutilmoqda (${lockoutSeconds}s)`
                : "To'liq ekranga qaytish"}
            </button>
          </div>
        </div>
      )}

      {/* Boshlang'ich to'liq ekran talabi */}
      {requireFullscreen && !isFullscreen && !showCheaterAlarm && !isTerminated && !hasEnteredOnce && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center select-none backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-blue-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              To&apos;liq ekran rejimi
            </h2>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              Imtihon to&apos;liq ekran rejimida o&apos;tkaziladi. Oynadan chiqish yoki vkladkani almashtirish qoidabuzarlik hisoblanadi.
            </p>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 mb-6 text-xs text-slate-300 text-left">
              Maksimal 2 ta ogohlantirish beriladi. 3-qoidabuzarlikda test avtomatik bekor qilinadi.
            </div>
            <button
              onClick={enterFullscreen}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm cursor-pointer"
            >
              Imtihonni boshlash
            </button>
          </div>
        </div>
      )}



      {/* Asosiy kontent */}
      {children}
    </div>
  );
}
