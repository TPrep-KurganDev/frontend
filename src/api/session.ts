import { api } from './api';

export interface ExamSessionStartRequest {
  exam_id: number|undefined
  strategy: string
  n: number|null
}

export type Answers = {
  [key: number]: boolean;
};

export interface ExamSessionResponse {
  id: string
  questions: number[]
  answers: Answers
  exam_id: number
}

export async function getSession(session_id: string | null) {
  const res = await api.get<ExamSessionResponse>(`/session/${session_id}`);
  return res.data;
}

export async function createSession(data: ExamSessionStartRequest) {
  const res = await api.post<ExamSessionResponse>('/session/', data);
  return res.data;
}

export async function answerQuestion(session_id: string, question_id: number, value: boolean) {
  const res = await api.post<ExamSessionResponse>(`/session/${session_id}/answer?question_id=${question_id}&value=${value}`);
  return res.data;
}
