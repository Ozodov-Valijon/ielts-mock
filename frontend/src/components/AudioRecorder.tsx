'use client';

import React, { useState, useRef, useEffect } from 'react';
import AudioWaveform from '@/components/AudioWaveform';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [stream, recordedAudioUrl]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      setStream(mediaStream);

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
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
    } catch (err) {
      console.error('Mikrofonga kirish ruxsat etilmadi:', err);
      alert("Mikrofondan foydalanishga ruxsat berilmadi. Iltimos brauzeringiz sozlamalarida mikrofonni faollashtiring.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleConfirmAndUpload = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
    }
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
              className="flex-1 py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-xs transition"
            >
              🔄 Qayta yozish
            </button>
            <button
              onClick={handleConfirmAndUpload}
              className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center space-x-1"
            >
              <span>Serverga yuklash</span>
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
