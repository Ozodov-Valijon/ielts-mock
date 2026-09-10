import { Question, User, Test, Section, SectionState, SectionResult, WritingAnswer, SpeakingAnswer, Feedback, ReviewIdentity, AdminStats, TestSet, AntiCheatSummary } from './types';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '');

async function fetchApi<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    const detail: unknown = errorData.detail || errorData.message;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((item: { msg?: string }) => item.msg || 'Kiritilgan qiymat noto‘g‘ri').join('; ')
      : `API xatosi (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { identifier: string; password: string }) => 
    fetchApi<{access_token: string}>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { email: string; full_name: string; password: string; phone?: string }) => 
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchApi<User>('/auth/me'),

  // Tests
  getTests: () => fetchApi<Test[]>('/tests'),
  getTestSets: () => fetchApi<TestSet[]>('/test-sets'),
  createTest: (data?: { set_number?: number; test_mode?: string }) => 
    fetchApi<Test>('/tests', { method: 'POST', body: JSON.stringify(data || {}) }),
  getTestDetails: (testId: number | string) => fetchApi<Test>(`/tests/${testId}`),
  startSection: (testId: number | string, section: Section) => fetchApi<SectionState>(`/tests/${testId}/sections/${section}/start`, {method: 'POST'}),
  startListeningAudio: (testId: number | string) => fetchApi<SectionState>(`/tests/${testId}/listening/audio/start`, {method: 'POST'}),
  logAntiCheatEvent: (testId: number | string, event_type: string, details?: string) =>
    fetchApi<AntiCheatSummary & {auto_terminated?: boolean}>(`/tests/${testId}/anticheat-event`, {
      method: 'POST',
      body: JSON.stringify({ event_type, details })
    }),

  // Reading
  getReadingQuestions: (testId: number | string, set_number?: number) => 
    fetchApi<Question[]>(`/tests/${testId}/reading/questions${set_number ? `?set_number=${set_number}` : ''}`),
  submitReadingAnswers: (testId: number | string, answers: { question_id: number; user_answer: string }[]) => 
    fetchApi<SectionResult>(`/tests/${testId}/reading/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Listening
  getListeningQuestions: (testId: number | string, set_number?: number) => 
    fetchApi<Question[]>(`/tests/${testId}/listening/questions${set_number ? `?set_number=${set_number}` : ''}`),
  submitListeningAnswers: (testId: number | string, answers: { question_id: number; user_answer: string }[]) => 
    fetchApi<SectionResult>(`/tests/${testId}/listening/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Writing
  getWritingTopics: (testId: number | string, set_number?: number) => 
    fetchApi<Question[]>(`/tests/${testId}/writing/topics${set_number ? `?set_number=${set_number}` : ''}`),
  submitWriting: (testId: number | string, task_number: number, user_text: string) => 
    fetchApi(`/tests/${testId}/writing/submit`, { 
      method: 'POST', 
      body: JSON.stringify({ task_number, user_text }) 
    }),
  getWritingResults: (testId: number | string) => 
    fetchApi<WritingAnswer[]>(`/tests/${testId}/writing/results`),

  // Speaking
  getSpeakingTopics: (testId: number | string, set_number?: number) => 
    fetchApi<Question[]>(`/tests/${testId}/speaking/topics${set_number ? `?set_number=${set_number}` : ''}`),
  uploadSpeakingAudio: (testId: number | string, part_number: number, blob: Blob) => {
    const formData = new FormData();
    formData.append('part_number', String(part_number));
    const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
    formData.append('file', blob, `speaking_part_${part_number}.${extension}`);
    return fetchApi(`/tests/${testId}/speaking/upload`, { 
      method: 'POST', 
      body: formData 
    });
  },
  getSpeakingResults: (testId: number | string) => 
    fetchApi<SpeakingAnswer[]>(`/tests/${testId}/speaking/results`),
  finishSpeaking: (testId: number | string) => fetchApi(`/tests/${testId}/speaking/finish`, {method: 'POST'}),

  // Results & Progress
  getFeedback: (testId: number | string) => 
    fetchApi<Feedback>(`/tests/${testId}/feedback`),
  getProgress: () => 
    fetchApi('/me/progress'),

  // Admin
  adminGetStudents: () => 
    fetchApi<(Omit<User, 'role' | 'email'> & {email: string; test_count: number})[]>('/admin/students'),
  adminGetPendingReviews: () => 
    fetchApi<{writing_pending: (WritingAnswer & ReviewIdentity)[]; speaking_pending: (SpeakingAnswer & ReviewIdentity)[]}>('/admin/pending-reviews'),
  adminGetWritingDetail: (id: number | string) =>
    fetchApi<WritingAnswer & ReviewIdentity>(`/admin/writing/${id}`),
  adminReviewWriting: (id: number | string, data: { admin_score: number; admin_feedback: string }) => 
    fetchApi(`/admin/writing/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  adminGetSpeakingDetail: (id: number | string) =>
    fetchApi<SpeakingAnswer & ReviewIdentity>(`/admin/speaking/${id}`),
  adminReviewSpeaking: (id: number | string, data: { admin_score: number; admin_feedback: string }) => 
    fetchApi(`/admin/speaking/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  adminGetQuestions: () =>
    fetchApi<Question[]>('/admin/questions'),
  adminAddQuestion: (data: Partial<Question>) => 
    fetchApi('/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
  adminGetStats: () => 
    fetchApi<AdminStats>('/admin/stats'),
  adminGetTests: () => fetchApi<(Test & ReviewIdentity)[]>('/admin/tests'),
  adminUploadAudio: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return fetchApi<{audio_url: string}>('/admin/content/audio', {method: 'POST', body});
  },
};

/** Only attach the bearer token to our own API, never to an arbitrary audio host. */
export async function getAudioBlob(src: string): Promise<Blob> {
  const isApiPath = src.startsWith('/api/v1/');
  const isConfiguredApi = /^https?:\/\//.test(BASE_URL) && src.startsWith(`${BASE_URL}/`);
  if (!isApiPath && !isConfiguredApi) throw new Error('Audio himoyalangan serverga qayta yuklanishi kerak.');
  const url = isApiPath ? `${BASE_URL}${src.slice('/api/v1'.length)}` : src;
  const token = localStorage.getItem('token');
  const response = await fetch(url, {headers: token ? {Authorization: `Bearer ${token}`} : {}});
  if (!response.ok) throw new Error(`Audio yuklanmadi (${response.status})`);
  return response.blob();
}
