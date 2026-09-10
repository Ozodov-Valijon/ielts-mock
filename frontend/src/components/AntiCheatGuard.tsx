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
  const [isFlagged, setIsFlagged] = useState(false);
  
  // Fullscreen nazorati
  const [isFullscreen, setIsFullscreen] = useState(!requireFullscreen);
  const hasEnteredOnceRef = useRef(false);
  const lastEventTimeRef = useRef<number>(0);

  // Katta CHITER signali va ovozi
  const [showCheaterAlarm, setShowCheaterAlarm] = useState(false);
  const [cheaterMessage, setCheaterMessage] = useState('');
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔊 Sirena ovozini yaratish (Web Audio API orqali har qanday brauzerda 100% ishlaydi)
  const playSiren = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(450, now + 0.25);
      osc.frequency.linearRampToValueAtTime(900, now + 0.5);
      osc.frequency.linearRampToValueAtTime(450, now + 0.75);
      osc.frequency.linearRampToValueAtTime(900, now + 1.0);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn("Siren audio xatoligi:", e);
    }
  }, []);

  // 🗣️ Ovozli "CHITER!" ogohlantirishi (SpeechSynthesis orqali)
  const speakCheater = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Chiter! Qoidabuzarlik aniqlandi! Testga qayting!");
        utterance.rate = 1.05;
        utterance.pitch = 1.2;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis xatoligi:", e);
    }
  }, []);

  // Ovoz va sirenani ishga tushirish funksiyasi
  const triggerAlarm = useCallback((message: string) => {
    setCheaterMessage(message);
    setShowCheaterAlarm(true);
    playSiren();
    speakCheater();

    // Agar ekranga qaytmasa, har 3.5 soniyada qayta ogohlantirib turadi
    if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
    soundIntervalRef.current = setInterval(() => {
      playSiren();
      speakCheater();
    }, 3500);
  }, [playSiren, speakCheater]);

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
      if (res.is_flagged_cheating) {
        setIsFlagged(true);
      }
    } catch (err) {
      console.error("Anti-cheat hodisasini yuborishda xatolik:", err);
    }
  }, [testId, triggerAlarm]);

  // To'liq ekranga o'tish funksiyasi
  const enterFullscreen = async () => {
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
      }
      setIsFullscreen(true);
      hasEnteredOnceRef.current = true;
      stopAlarm();
    } catch (err) {
      console.warn("Fullscreen ochishda brauzer cheklovi:", err);
      setIsFullscreen(true);
      hasEnteredOnceRef.current = true;
      stopAlarm();
    }
  };

  // 1. Sahifa ochilganda avtomatik to'liq ekranga o'tishga urinish
  useEffect(() => {
    const tryAutoFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
          hasEnteredOnceRef.current = true;
        }
      } catch {
        // Agar foydalanuvchi tugmani bosmagan bo'lsa brauzer bloklashi mumkin (overlay ochiladi)
      }
    };
    tryAutoFullscreen();
  }, []);

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

      // Agar oldin to'liq ekranda bo'lib, keyin chiqib ketgan bo'lsa -> KATTA CHITER SIGNALIZATSIYASI!
      if (!isFull && hasEnteredOnceRef.current) {
        reportEvent(
          'fullscreen_exit', 
          "Siz to'liq ekran (Fullscreen) rejimidan chiqdingiz! IELTS Mock imtihonida boshqa dastur va oynalarga o'tish qat'iyan taqiqlanadi!"
        );
      } else if (isFull) {
        stopAlarm();
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
  }, [requireFullscreen, reportEvent, stopAlarm]);

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

  return (
    <div className="relative select-none">
      {/* 🚨 KATTA "CHITER!" OGOHLANTIRISH VA SIRENA PARDASI (TO'LIQ EKRANDAN CHIQIB KETILGANDA) */}
      {showCheaterAlarm && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-4 text-center select-none backdrop-blur-2xl animate-in fade-in zoom-in-90">
          <div className="max-w-2xl w-full bg-gradient-to-b from-red-950 via-slate-950 to-black border-4 border-red-600 rounded-3xl p-8 sm:p-12 shadow-[0_0_80px_rgba(239,68,68,0.7)] relative overflow-hidden">
            
            {/* Pulsatsiya qiluvchi qizil nurlar */}
            <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />

            <div className="w-24 h-24 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center text-6xl mx-auto mb-4 border-2 border-red-500 shadow-2xl animate-bounce">
              🚨
            </div>

            {/* KATTA QALIN "CHITER!" YOZUVI */}
            <h1 className="text-6xl sm:text-8xl font-black text-red-500 tracking-widest uppercase drop-shadow-[0_5px_25px_rgba(239,68,68,1)] animate-pulse">
              CHITER!
            </h1>

            <div className="text-xl sm:text-2xl font-black text-white mt-2 uppercase tracking-wide">
              Qoidabuzarlik Qayd Etildi!
            </div>

            <p className="text-red-200 text-sm sm:text-base mt-4 mb-6 leading-relaxed max-w-lg mx-auto font-medium">
              {cheaterMessage || "Siz to'liq ekran rejimidan chiqdingiz yoki boshqa oynaga o'tdingiz. IELTS imtihonida oynadan chiqish qat'iyan taqiqlangan!"}
            </p>

            {/* Ogohlantirish hisoblagichi */}
            <div className="bg-red-600/20 border-2 border-red-500/50 rounded-2xl p-4 mb-8 text-center max-w-md mx-auto">
              <span className="text-xs text-red-300 font-bold uppercase tracking-wider block mb-1">Qoidabuzarlik darajasi:</span>
              <span className="text-3xl font-black text-white font-mono">{warnings} / 3</span>
              {(warnings >= 3 || isFlagged) && (
                <span className="block text-red-400 text-xs font-black mt-2 uppercase">
                  ⚠️ 3 marta qoidabuzarlik to&apos;ldi! Test chiterlik bayrog&apos;i bilan belgilandi.
                </span>
              )}
            </div>

            {/* To'liq ekranga qaytish tugmasi */}
            <button
              onClick={enterFullscreen}
              className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition transform hover:scale-[1.03] shadow-[0_10px_30px_rgba(239,68,68,0.5)] text-lg sm:text-xl flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="text-2xl">🖥️</span>
              <span>TO&apos;LIQ EKRANGA QAYTISH</span>
            </button>

            <p className="text-gray-400 text-xs mt-4">
              Imtihon shartlariga rioya qiling.
            </p>
          </div>
        </div>
      )}

      {/* 🔒 Boshlang'ich To'liq Ekran Talabi (Agar test endi boshlangan bo'lsa va hali full screenga kirmagan bo'lsa) */}
      {requireFullscreen && !isFullscreen && !showCheaterAlarm && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center select-none backdrop-blur-xl">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-blue-500/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="w-24 h-24 bg-blue-500/10 text-blue-400 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 border border-blue-500/20 shadow-inner">
              🖥️
            </div>
            
            <span className="bg-blue-500/20 text-blue-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-3 inline-block border border-blue-500/30">
              Imtihon Rejimi
            </span>
            
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
              Test Boshlandi!
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
              Haqiqiy IELTS formati bo&apos;yicha ishlash uchun test to&apos;liq ekranda (Fullscreen) o&apos;tkaziladi.
            </p>

            <button
              onClick={enterFullscreen}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold py-4 px-6 rounded-2xl transition transform hover:scale-[1.02] shadow-2xl text-lg flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="text-2xl">🚀</span>
              <span>Testni Boshlash</span>
            </button>
          </div>
        </div>
      )}



      {/* Asosiy kontent */}
      {children}
    </div>
  );
}
