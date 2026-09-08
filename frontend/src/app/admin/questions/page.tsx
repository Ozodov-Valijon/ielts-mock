'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminQuestionsPage() {
  const [section, setSection] = useState('reading');
  const [qType, setQType] = useState('multiple_choice');
  const [qText, setQText] = useState('');
  const [passageText, setPassageText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [orderNum, setOrderNum] = useState(1);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload: any = {
        section,
        set_number: 1,
        question_type: qType,
        question_text: qText,
        order_num: Number(orderNum),
        correct_answer: correctAnswer || null,
        passage_text: section === 'reading' ? (passageText || null) : null,
        audio_url: section === 'listening' ? (audioUrl || null) : null,
        options: qType === 'multiple_choice' ? options.filter(Boolean) : null,
      };

      await api.adminAddQuestion(payload);
      setSuccess(true);
      setQText('');
      setCorrectAnswer('');
      setOptions(['', '']);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Savol qo\'shishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (idx: number) => {
    const newOps = [...options];
    newOps.splice(idx, 1);
    setOptions(newOps);
  };
  const updateOption = (idx: number, val: string) => {
    const newOps = [...options];
    newOps[idx] = val;
    setOptions(newOps);
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Savollar Banki
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Yangi Savol Qo&apos;shish</h1>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition"
          >
            ← Admin Dashboard
          </Link>
        </div>
        
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl mb-6 font-bold flex items-center space-x-2">
            <span>✓ Savol bazaga muvaffaqiyatli qo&apos;shildi!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl mb-6 font-bold flex items-center space-x-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bo&apos;lim (Section)</label>
              <select 
                value={section} 
                onChange={(e) => setSection(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              >
                <option value="reading">Reading (O&apos;qish)</option>
                <option value="listening">Listening (Eshitish)</option>
                <option value="writing">Writing (Yozish)</option>
                <option value="speaking">Speaking (Gapirish)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Savol turi (Type)</label>
              <select 
                value={qType} 
                onChange={(e) => setQType(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
              >
                <option value="multiple_choice">Multiple Choice (Variantli)</option>
                <option value="true_false">True / False / Not Given</option>
                <option value="fill_blank">Fill in the Blank (Bo&apos;sh joy to&apos;ldirish)</option>
                <option value="writing_task_1">Writing Task 1</option>
                <option value="writing_task_2">Writing Task 2</option>
                <option value="speaking_part_1">Speaking Part 1</option>
                <option value="speaking_part_2">Speaking Part 2</option>
                <option value="speaking_part_3">Speaking Part 3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Savol / Topshiriq matni</label>
            <textarea 
              required 
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm h-28" 
              placeholder="Savol matnini kiriting..."
            ></textarea>
          </div>

          {section === 'reading' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reading Passage (Matn)</label>
              <textarea 
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-serif h-40" 
                placeholder="Reading matnini kiriting..."
              ></textarea>
            </div>
          )}

          {section === 'listening' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Audio URL (MP3 havola)</label>
              <input 
                type="url" 
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                placeholder="https://misol.uz/audio.mp3" 
              />
            </div>
          )}

          {qType === 'multiple_choice' && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Variantlar</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input 
                    value={opt} 
                    onChange={(e) => updateOption(i, e.target.value)} 
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm" 
                    placeholder={`Variant ${i + 1}`} 
                    required 
                  />
                  {options.length > 2 && (
                    <button 
                      type="button" 
                      onClick={() => removeOption(i)} 
                      className="bg-red-500 text-white px-3 rounded-lg font-bold text-sm hover:bg-red-600 transition"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={addOption} 
                className="text-blue-600 font-bold text-xs mt-2 hover:underline"
              >
                + Variant qo&apos;shish
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">To&apos;g&apos;ri javob</label>
              <input 
                type="text" 
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                placeholder="To'g'ri javob matni..." 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tartib raqami</label>
              <input 
                required 
                type="number" 
                min="1" 
                value={orderNum}
                onChange={(e) => setOrderNum(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition shadow disabled:opacity-50"
          >
            {submitting ? 'Qo\'shilmoqda...' : 'Savolni Saqlash'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
