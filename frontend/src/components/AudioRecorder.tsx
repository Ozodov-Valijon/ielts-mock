'use client';

import React, { useState, useRef, useEffect } from 'react';
import AudioWaveform from '@/components/AudioWaveform';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => Promise<void>;
  disabled?: boolean;
  maxSeconds?: number;
}

export default function AudioRecorder({ onRecordingComplete, disabled = false, maxSeconds = 300 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const recorder = mediaRecorderRef.current;
      if (recorder) { recorder.onstop = null; if (recorder.state !== 'inactive') recorder.stop(); }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);
  useEffect(() => () => { if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl); }, [recordedAudioUrl]);
  useEffect(() => {
    if (!disabled) return;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }, [disabled]);

  const startRecording = async () => {
    if (disabled || busy || isRecording) return;
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Audio yozish qo‘llab-quvvatlanmaydi. HTTPS orqali zamonaviy brauzerda oching.');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      setStream(mediaStream);
      streamRef.current = mediaStream;

      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
      const mediaRecorder = new MediaRecorder(mediaStream, mimeType ? {mimeType} : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || chunksRef.current[0]?.type });
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        if (!blob.size) { setError('Audio bo‘sh. Mikrofonni tekshirib qayta yozing.'); }
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setDuration(0);
      setRecordedBlob(null);
      setRecordedAudioUrl(null);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      const maximum = setTimeout(() => { if (mediaRecorder.state !== 'inactive') mediaRecorder.stop(); }, maxSeconds * 1000);
      mediaRecorder.addEventListener('stop', () => clearTimeout(maximum), {once: true});
    } catch (err) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      setStream(null);
      setError(err instanceof Error ? err.message : 'Mikrofonga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleConfirmAndUpload = async () => {
    if (!recordedBlob || busy || disabled) return;
    setBusy(true); setError('');
    try { await onRecordingComplete(recordedBlob); }
    catch (err) { setError(err instanceof Error ? err.message : 'Audio yuklanmadi. Qayta urinib ko‘ring.'); }
    finally { setBusy(false); }
  };

  const handleReset = () => {
    setRecordedBlob(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setDuration(0);
  };

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
      {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
      {disabled && <p className="text-sm text-amber-800 mb-3">Bo‘lim vaqti tugadi.</p>}
      {/* Taymer va Ovoz to'lqini */}
      <div className="text-2xl mb-3 font-mono font-black text-gray-800 tracking-wider">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>

      {isRecording && (
        <div className="w-full max-w-sm mb-4">
          <AudioWaveform stream={stream} isRecording={isRecording} />
        </div>
      )}

      {/* Yozuvdan keyingi tekshirish va tasdiqlash */}
      {recordedBlob && recordedAudioUrl && !isRecording ? (
        <div className="flex flex-col items-center space-y-4 w-full max-w-md animate-in fade-in">
          <div className="w-full bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <audio src={recordedAudioUrl} controls className="w-full h-10" />
          </div>

          <div className="flex items-center space-x-3 w-full">
            <button
              onClick={handleReset}
              disabled={busy || disabled}
              className="flex-1 py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-xs transition"
            >
              🔄 Qayta yozish
            </button>
            <button
              onClick={handleConfirmAndUpload}
              disabled={busy || disabled || !recordedBlob.size}
              className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center space-x-1"
            >
              <span>{busy ? 'Yuklanmoqda…' : 'Serverga yuklash'}</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      ) : (
        /* Yozish / To'xtatish tugmalari */
        <div>
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={disabled || busy}
              className="flex items-center space-x-2.5 bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-full transition shadow-md transform hover:scale-105 font-bold text-sm"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
              <span>Javobni Yozishni Boshlash</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2.5 bg-gray-900 hover:bg-black text-white px-7 py-3 rounded-full transition shadow-lg transform hover:scale-105 font-bold text-sm"
            >
              <div className="w-3.5 h-3.5 bg-red-500 animate-ping rounded-full"></div>
              <span>Yozuvni To&apos;xtatish &amp; Saqlash</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
