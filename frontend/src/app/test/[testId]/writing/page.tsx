'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Timer from '../../../components/Timer';
import { useRouter, useParams } from 'next/navigation';

export default function WritingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = Number(params.testId);

  const [activeTab, setActiveTab] = useState<'task1' | 'task2'>('task1');
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // await api.submitWriting(testId, task1Text, task2Text);
      setTimeout(() => {
        setIsSubmitted(true);
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      alert('Xatolik yuz berdi');
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    router.push(`/test/${testId}/speaking`);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Writing Test</h1>
          {!isSubmitted && <Timer durationMinutes={60} onTimeUp={handleSubmit} />}
        </div>

        {isSubmitted ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Yuborildi</h2>
            <p className="text-gray-600 mb-8">Tekshiruv kutilmoqda... (Pending icon)</p>
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              Keyingi: Speaking
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 text-center font-semibold ${activeTab === 'task1' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('task1')}
              >
                Task 1
              </button>
              <button
                className={`flex-1 py-4 text-center font-semibold ${activeTab === 'task2' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('task2')}
              >
                Task 2
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'task1' ? (
                <div>
                  <h3 className="font-bold text-gray-700 mb-2">Siz kamida 150 ta so'z yozishingiz kerak.</h3>
                  <textarea
                    value={task1Text}
                    onChange={(e) => setTask1Text(e.target.value)}
                    className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Task 1 javobingizni shu yerga yozing..."
                  ></textarea>
                  <div className="mt-2 text-sm font-medium text-gray-500 text-right">
                    Word count: <span className={wordCount(task1Text) < 150 ? 'text-red-500' : 'text-green-600'}>{wordCount(task1Text)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-gray-700 mb-2">Siz kamida 250 ta so'z yozishingiz kerak.</h3>
                  <textarea
                    value={task2Text}
                    onChange={(e) => setTask2Text(e.target.value)}
                    className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="Task 2 javobingizni shu yerga yozing..."
                  ></textarea>
                  <div className="mt-2 text-sm font-medium text-gray-500 text-right">
                    Word count: <span className={wordCount(task2Text) < 250 ? 'text-red-500' : 'text-green-600'}>{wordCount(task2Text)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50"
              >
                {submitting ? 'Yuborilmoqda...' : 'Barchasini Yuborish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
