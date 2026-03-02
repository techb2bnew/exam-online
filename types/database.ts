export type Role = 'admin' | 'student';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Test {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  total_marks: number;
  instructions: string | null;
  created_by: string;
  created_at: string;
}

export type QuestionType = 'radio' | 'checkbox' | 'dropdown' | 'text';

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  question_type: QuestionType;
  marks: number;
  order_index: number;
  created_at: string;
}

export interface Option {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  created_at: string;
}

export interface Assignment {
  id: string;
  test_id: string;
  student_id: string;
  status: 'pending' | 'completed';
  assigned_at: string;
}

export interface Submission {
  id: string;
  test_id: string;
  student_id: string;
  answers: Record<string, string | string[]>;
  marks_obtained: number | null;
  submitted_at: string;
}
