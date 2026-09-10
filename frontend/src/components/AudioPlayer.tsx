'use client';

import { useEffect, useRef, useState } from 'react';
import { getAudioBlob } from '@/lib/api';
import { utcTime } from '@/lib/exam';
import { SectionState } from '@/lib/types';

interface AudioPlayerProps {
  src: string;
  allowReplay?: boolean;
  startedAt?: string | null;
  onFirstPlay?: () => Promise<SectionState>;
}

export default function AudioPlayer({ src, allowReplay = false, startedAt, onFirstPlay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const started = useRef<string | null>(startedAt || null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;
    getAudioBlob(src).then(blob => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Audio yuklanmadi'); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio || busy || (!allowReplay && ended)) return;
    if (playing) { audio.pause(); return; }
    setBusy(true); setError('');
    try {
      if (!allowReplay && !started.current) {
        if (!onFirstPlay) throw new Error('Audio boshlash xizmati mavjud emas');
        const state = await onFirstPlay();
        started.current = state.audio_started_at || null;
      }
      if (!allowReplay && started.current) {
        const offset = Math.max(0, (Date.now() - utcTime(started.current)) / 1000);
        if (Number.isFinite(audio.duration) && offset >= audio.duration) { setEnded(true); setProgress(100); return; }
        audio.currentTime = offset;
      }
      await audio.play();
    } catch (err) { setError(err instanceof Error ? err.message : 'Audio ijro etilmadi'); }
    finally { setBusy(false); }
  };

  return <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
    <audio ref={audioRef} src={url || undefined} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); setEnded(true); }}
      onError={() => setError('Brauzer audioni o‘qiy olmadi. Fayl formatini tekshiring.')}
      onTimeUpdate={() => { const a = audioRef.current; if (a && a.duration > 0) setProgress(a.currentTime / a.duration * 100); }} />
    <div className="flex items-center gap-4">
      <button type="button" onClick={play} disabled={!url || busy || (!allowReplay && ended)} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl px-4 py-3 font-bold" aria-label={playing ? 'Audioni to‘xtatish' : 'Audioni tinglash'}>{busy ? '…' : playing ? '❚❚' : '▶'}</button>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{width: `${progress}%`}} /></div>
      {!allowReplay && <span className="text-xs text-gray-600">{ended ? 'Tinglash vaqti tugadi' : 'Bir marta; davom ettirish mumkin'}</span>}
    </div>
    {!allowReplay && <p className="text-xs text-gray-500 mt-2">Pauza yoki sahifani yangilash audio vaqtini to‘xtatmaydi.</p>}
    {error && <p role="alert" className="text-red-700 text-sm mt-2">{error}</p>}
  </div>;
}
