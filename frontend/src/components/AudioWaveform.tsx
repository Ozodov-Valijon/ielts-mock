'use client';

import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  stream: MediaStream | null;
  isRecording: boolean;
  className?: string;
}

export default function AudioWaveform({ stream, isRecording, className = '' }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isRecording || !stream || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);

          // Chiroyli gradient rang (ko'kdan yashil/qizilga)
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#2563eb'); // Blue
          gradient.addColorStop(0.5, '#06b6d4'); // Cyan
          gradient.addColorStop(1, '#10b981'); // Green

          ctx.fillStyle = gradient;
          const y = (canvas.height - barHeight) / 2;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 2, Math.max(barHeight, 4), 3);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn("Audio Waveform analizatorida xatolik:", e);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stream, isRecording]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={320}
        height={60}
        className="w-full max-w-xs h-12 bg-gray-900 rounded-xl shadow-inner border border-gray-800"
      />
      <div className="flex items-center space-x-1.5 mt-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
        <span className="text-[11px] font-semibold tracking-wider text-red-600 uppercase">
          Jonli Mikrofon Ovoz To&apos;lqini
        </span>
      </div>
    </div>
  );
}
