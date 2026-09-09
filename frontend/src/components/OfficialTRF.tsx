'use client';

import React from 'react';
import { Feedback } from '@/lib/types';
import { useAuth } from '@/lib/auth';

interface OfficialTRFProps {
  feedback: Feedback;
  testId: string;
}

export default function OfficialTRF({ feedback, testId }: OfficialTRFProps) {
  const { user } = useAuth();

  const getCEFR = (band: number) => {
    if (band >= 8.5) return 'C2';
    if (band >= 7.0) return 'C1';
    if (band >= 5.5) return 'B2';
    if (band >= 4.0) return 'B1';
    return 'A2 / Below';
  };

  const candidateId = `UZ-${String(user?.id || 101).padStart(6, '0')}`;
  const trfNumber = `26UZ${String(testId).padStart(4, '0')}ACAD`;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="my-8">
      {/* Chop etish / PDF yuklab olish tugmasi (faqat ekranda ko'rinadi) */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
        >
          <span>🖨️</span>
          <span>Rasmiy Sertifikatni Chop Etish / PDF Saqlash</span>
        </button>
      </div>

      {/* Rasmiy IELTS Test Report Form (TRF) Hujjati */}
      <div 
        id="official-trf"
        className="bg-white text-gray-900 border-2 border-gray-800 rounded-lg p-6 sm:p-8 max-w-4xl mx-auto shadow-xl print:shadow-none print:border-2 print:m-0 print:max-w-full font-serif"
      >
        {/* Yuqori Sarlavha */}
        <div className="border-b-2 border-red-700 pb-4 mb-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-red-600 text-white font-black text-2xl px-2.5 py-0.5 rounded tracking-tighter font-sans">
                IELTS
              </span>
              <span className="text-xl font-bold tracking-tight text-gray-900 font-sans">
                Test Report Form
              </span>
            </div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1 font-sans font-semibold">
              ACADEMIC MODULE &bull; COMPUTER-DELIVERED MOCK TEST
            </p>
          </div>

          <div className="text-right font-sans">
            <p className="text-xs font-semibold text-gray-500">TRF Number:</p>
            <p className="text-sm font-mono font-black text-blue-900 tracking-wider">{trfNumber}</p>
          </div>
        </div>

        {/* Nomzod Ma'lumotlari Bloklari */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-md border border-gray-300 text-xs mb-5 font-sans">
          <div>
            <span className="text-gray-500 block uppercase text-[10px] font-bold">Candidate Name</span>
            <span className="font-bold text-gray-900 text-sm uppercase">{user?.full_name || 'Valijon Ozodov'}</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[10px] font-bold">Candidate Number</span>
            <span className="font-mono font-bold text-gray-800">{candidateId}</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[10px] font-bold">Test Date</span>
            <span className="font-semibold text-gray-800">{currentDate}</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[10px] font-bold">Country / Region</span>
            <span className="font-semibold text-gray-800">Uzbekistan</span>
          </div>
        </div>

        {/* Rasmiy Natijalar Jadvali */}
        <div className="mb-6 font-sans">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Test Results</h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 border-2 border-gray-800 divide-x-2 divide-gray-800 text-center bg-white">
            {/* Listening */}
            <div className="p-3">
              <p className="text-[11px] font-bold text-gray-600 uppercase">Listening</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{feedback.listening_score.toFixed(1)}</p>
            </div>

            {/* Reading */}
            <div className="p-3">
              <p className="text-[11px] font-bold text-gray-600 uppercase">Reading</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{feedback.reading_score.toFixed(1)}</p>
            </div>

            {/* Writing */}
            <div className="p-3">
              <p className="text-[11px] font-bold text-gray-600 uppercase">Writing</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{feedback.writing_score.toFixed(1)}</p>
            </div>

            {/* Speaking */}
            <div className="p-3">
              <p className="text-[11px] font-bold text-gray-600 uppercase">Speaking</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{feedback.speaking_score.toFixed(1)}</p>
            </div>

            {/* Overall Band */}
            <div className="p-3 bg-red-50 sm:col-span-1">
              <p className="text-[11px] font-black text-red-700 uppercase">Overall Band</p>
              <p className="text-3xl font-black text-red-600 mt-0.5">{feedback.overall_band.toFixed(1)}</p>
            </div>

            {/* CEFR Level */}
            <div className="p-3 bg-blue-50 sm:col-span-1">
              <p className="text-[11px] font-black text-blue-700 uppercase">CEFR Level</p>
              <p className="text-2xl font-black text-blue-800 mt-1">{getCEFR(feedback.overall_band)}</p>
            </div>
          </div>
        </div>

        {/* Imtihonchi va Xavfsizlik Validatsiyasi */}
        <div className="border-t border-gray-300 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-end gap-6 font-sans text-xs">
          <div className="space-y-1 text-gray-600">
            <p className="font-semibold text-gray-900">Administrator / Examiner Centre:</p>
            <p>IELTS Mock Testing Assessment Board &bull; Tashkent, Uzbekistan</p>
            <p className="text-[11px] text-gray-500 italic">
              Certified automated & certified examiner validation system.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-center">
            {/* Muhr simulatsiyasi */}
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-red-500/80 flex flex-col items-center justify-center p-1 text-red-600 rotate-[-12deg] select-none">
              <span className="text-[8px] font-bold uppercase tracking-wider">OFFICIAL MOCK</span>
              <span className="text-xs font-black">VERIFIED</span>
              <span className="text-[8px] font-medium">{currentDate}</span>
            </div>

            {/* Imzo */}
            <div className="border-b-2 border-gray-800 pb-1 px-4 text-center">
              <span className="font-serif italic text-base text-blue-950 font-bold">IELTS Centre Examiner</span>
              <span className="block text-[10px] text-gray-500 uppercase tracking-wider mt-1">Official Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
