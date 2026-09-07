'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function AdminQuestionsPage() {
  const [section, setSection] = useState('reading');
  const [qType, setQType] = useState('multiple_choice');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Yangi Savol Qo'shish</h1>
        
        {success && (
          <div className="bg-green-100 text-green-800 p-4 rounded mb-6 font-bold">
            Savol muvaffaqiyatli qo'shildi!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Bo'lim (Section)</label>
              <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full p-2 border rounded focus:ring-blue-500">
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Savol turi (Type)</label>
              <select value={qType} onChange={(e) => setQType(e.target.value)} className="w-full p-2 border rounded focus:ring-blue-500">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False / Not Given</option>
                <option value="fill_blank">Fill in the Blank</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Savol matni</label>
            <textarea required className="w-full p-3 border rounded focus:ring-blue-500 h-24" placeholder="Savolni kiriting..."></textarea>
          </div>

          {section === 'reading' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reading Passage (Matn)</label>
              <textarea className="w-full p-3 border rounded focus:ring-blue-500 h-48" placeholder="Matnni kiriting..."></textarea>
            </div>
          )}

          {section === 'listening' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Audio URL</label>
              <input type="url" className="w-full p-2 border rounded focus:ring-blue-500" placeholder="https://..." />
            </div>
          )}

          {qType === 'multiple_choice' && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-3">Variantlar</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={opt} onChange={(e) => updateOption(i, e.target.value)} className="flex-1 p-2 border rounded" placeholder={`Variant ${i+1}`} required />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="bg-red-500 text-white px-3 rounded font-bold">X</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOption} className="text-blue-600 font-bold text-sm mt-2">+ Variant qo'shish</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">To'g'ri javob</label>
              <input required type="text" className="w-full p-2 border rounded focus:ring-blue-500" placeholder="Javob..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tartib raqami</label>
              <input required type="number" min="1" className="w-full p-2 border rounded focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition">
            Savol qo'shish
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
