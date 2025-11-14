import { api } from './api';

export interface ExamSessionStartRequest {
  exam_id: number
  strategy: string
  n: number|null
}

export interface ExamSessionResponse {
  id: string
  questions: number[]
}

export async function getSession(session_id: string) {
  const token = localStorage.getItem('accessToken');
  const res = await api.get<ExamSessionResponse>(`/session/${session_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}

export async function createSession(data: ExamSessionStartRequest) {
  const token = localStorage.getItem('accessToken');
  const res = await api.post<ExamSessionResponse>('/session/', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}

export async function answerQuestion(session_id: string, question_id: number, value: boolean) {
  const token = localStorage.getItem('accessToken');
  const res = await api.post<ExamSessionResponse>(`/session/${session_id}/answer?question_id=${question_id}&value=${value}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}
