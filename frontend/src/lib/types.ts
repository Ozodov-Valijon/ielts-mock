export interface User {
  id: number;
  email: string;
  phone?: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface Test {
  id: number;
  user_id: number;
  status: string;
  set_number?: number;
  test_mode?: string;
  overall_band_score?: number | null;
  started_at: string;
  completed_at?: string | null;
  tab_switches?: number;
  paste_attempts?: number;
  is_flagged_cheating?: boolean;
}

export interface Question {
  id: number;
  section: string;
  set_number?: number;
  question_type: string;
  question_text: string;
  passage_text?: string;
  audio_url?: string;
  options?: string[];
  correct_answer?: string;
  order_num: number;
}

export interface AnswerResult {
  question_id: number;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface SectionResult {
  total_questions: number;
  correct_answers: number;
  score: number;
  results: AnswerResult[];
}

export interface WritingAnswer {
  id: number;
  test_id: number;
  task_number: number;
  user_text: string;
  ai_analysis?: string;
  ai_score?: number;
  admin_feedback?: string;
  admin_score?: number;
  status: string;
  reviewed_at?: string;
}

export interface SpeakingAnswer {
  id: number;
  test_id: number;
  part_number: number;
  audio_url?: string;
  transcript?: string;
  ai_analysis?: string;
  ai_score?: number;
  admin_feedback?: string;
  admin_score?: number;
  status: string;
  reviewed_at?: string;
}

export interface QuestionReviewItem {
  question_id: number;
  order_num: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface AntiCheatSummary {
  tab_switches: number;
  paste_attempts: number;
  is_flagged_cheating: boolean;
}

export interface Feedback {
  id: number;
  test_id: number;
  reading_score?: number | null;
  listening_score?: number | null;
  writing_score?: number | null;
  speaking_score?: number | null;
  overall_band?: number | null;
  is_approved?: boolean;
  writing_status?: string;
  speaking_status?: string;
  writing_feedback?: string;
  speaking_feedback?: string;
  admin_notes?: string;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  reading_details?: QuestionReviewItem[];
  listening_details?: QuestionReviewItem[];
  anti_cheat?: AntiCheatSummary;
}
