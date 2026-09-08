'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mikrofonga kirish ruxsat etilmadi', err);
      alert('Mikrofonga kirish ruxsat etilmadi');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <div className="text-xl mb-4 font-mono font-medium text-gray-700">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition shadow-md"
        >
          <div className="w-3 h-3 rounded-full bg-white"></div>
          <span>Yozishni boshlash</span>
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full transition shadow-md"
        >
          <div className="w-3 h-3 bg-red-500 animate-pulse rounded-full"></div>
          <span>To&apos;xtatish</span>
        </button>
      )}
    </div>
  );
}
