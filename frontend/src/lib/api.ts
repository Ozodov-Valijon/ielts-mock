import { Question } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Faqat FormData bo'lmaganda Content-Type ni JSON qilamiz
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || 'API xatosi yuz berdi';
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) => 
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { email: string; full_name: string; password: string; phone?: string }) => 
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchApi('/auth/me'),

  // Tests
  getTests: () => fetchApi('/tests'),
  createTest: (data?: { set_number?: number; test_mode?: string }) => 
    fetchApi('/tests', { method: 'POST', body: JSON.stringify(data || {}) }),
  getTestDetails: (testId: number | string) => fetchApi(`/tests/${testId}`),
  logAntiCheatEvent: (testId: number | string, event_type: string, details?: string) =>
    fetchApi(`/tests/${testId}/anticheat-event`, {
      method: 'POST',
      body: JSON.stringify({ event_type, details })
    }),

  // Reading
  getReadingQuestions: (testId: number | string, set_number?: number) => 
    fetchApi(`/tests/${testId}/reading/questions${set_number ? `?set_number=${set_number}` : ''}`),
  submitReadingAnswers: (testId: number | string, answers: { question_id: number; user_answer: string }[]) => 
    fetchApi(`/tests/${testId}/reading/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Listening
  getListeningQuestions: (testId: number | string, set_number?: number) => 
    fetchApi(`/tests/${testId}/listening/questions${set_number ? `?set_number=${set_number}` : ''}`),
  submitListeningAnswers: (testId: number | string, answers: { question_id: number; user_answer: string }[]) => 
    fetchApi(`/tests/${testId}/listening/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Writing
  getWritingTopics: (testId: number | string, set_number?: number) => 
    fetchApi(`/tests/${testId}/writing/topics${set_number ? `?set_number=${set_number}` : ''}`),
  submitWriting: (testId: number | string, task_number: number, user_text: string) => 
    fetchApi(`/tests/${testId}/writing/submit`, { 
      method: 'POST', 
      body: JSON.stringify({ task_number, user_text }) 
    }),
  getWritingResults: (testId: number | string) => 
    fetchApi(`/tests/${testId}/writing/results`),

  // Speaking
  getSpeakingTopics: (testId: number | string, set_number?: number) => 
    fetchApi(`/tests/${testId}/speaking/topics${set_number ? `?set_number=${set_number}` : ''}`),
  uploadSpeakingAudio: (testId: number | string, part_number: number, blob: Blob) => {
    const formData = new FormData();
    formData.append('part_number', String(part_number));
    formData.append('file', blob, `speaking_part_${part_number}.webm`);
    return fetchApi(`/tests/${testId}/speaking/upload`, { 
      method: 'POST', 
      body: formData 
    });
  },
  getSpeakingResults: (testId: number | string) => 
    fetchApi(`/tests/${testId}/speaking/results`),

  // Results & Progress
  getFeedback: (testId: number | string) => 
    fetchApi(`/tests/${testId}/feedback`),
  getProgress: () => 
    fetchApi('/me/progress'),

  // Admin
  adminGetStudents: () => 
    fetchApi('/admin/students'),
  adminGetPendingReviews: () => 
    fetchApi('/admin/pending-reviews'),
  adminGetWritingDetail: (id: number | string) =>
    fetchApi(`/admin/writing/${id}`),
  adminReviewWriting: (id: number | string, data: { admin_score: number; admin_feedback: string }) => 
    fetchApi(`/admin/writing/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  adminGetSpeakingDetail: (id: number | string) =>
    fetchApi(`/admin/speaking/${id}`),
  adminReviewSpeaking: (id: number | string, data: { admin_score: number; admin_feedback: string }) => 
    fetchApi(`/admin/speaking/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  adminGetQuestions: () =>
    fetchApi('/admin/questions'),
  adminAddQuestion: (data: Partial<Question>) => 
    fetchApi('/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
  adminGetStats: () => 
    fetchApi('/admin/stats'),
};
