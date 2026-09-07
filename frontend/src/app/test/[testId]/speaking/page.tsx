'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AudioRecorder from '../../../components/AudioRecorder';
import { useRouter, useParams } from 'next/navigation';

export default function SpeakingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = Number(params.testId);

  const [partStatus, setPartStatus] = useState<Record<number, 'pending' | 'uploading' | 'completed'>>({
    1: 'pending', 2: 'pending', 3: 'pending'
  });

  const handleAudioComplete = async (part: number, blob: Blob) => {
    setPartStatus(prev => ({ ...prev, [part]: 'uploading' }));
    try {
      // await api.uploadSpeakingAudio(testId, part, blob);
      setTimeout(() => {
        setPartStatus(prev => ({ ...prev, [part]: 'completed' }));
      }, 1500);
    } catch (error) {
      alert('Xatolik yuz berdi');
      setPartStatus(prev => ({ ...prev, [part]: 'pending' }));
    }
  };

  const allCompleted = Object.values(partStatus).every(s => s === 'completed');

  const renderPart = (partNum: number, title: string, prompt: string) => {
    const status = partStatus[partNum];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{prompt}</p>
        
        {status === 'pending' && (
          <AudioRecorder onRecordingComplete={(blob) => handleAudioComplete(partNum, blob)} />
        )}
        
        {status === 'uploading' && (
          <div className="text-center py-4 text-blue-600 font-medium animate-pulse">
            Yuklanmoqda...
          </div>
        )}
        
        {status === 'completed' && (
          <div className="text-center py-4 text-green-600 font-bold flex items-center justify-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span>✓ Yuborildi</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Speaking Test</h1>

        {renderPart(1, 'Part 1: Introduction and Interview', "Can you tell me a little bit about your hometown?\nWhat do you like most about it?")}
        {renderPart(2, 'Part 2: Long Turn', "Describe a memorable journey you have made.\nYou should say:\n- where you went\n- how you traveled\n- why you went on the journey\nand explain why it is memorable.")}
        {renderPart(3, 'Part 3: Discussion', "How has transportation changed in your country in recent years?\nDo you think public transport will improve in the future?")}

        {allCompleted && (
          <div className="bg-green-50 p-6 rounded-lg text-center mt-8 border border-green-200 shadow-sm">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Barcha qismlar yuborildi!</h2>
            <p className="text-green-700 mb-6">Tekshiruv kutilmoqda...</p>
            <button
              onClick={() => router.push(`/test/${testId}/results`)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition shadow"
            >
              Natijalarni ko'rish
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
