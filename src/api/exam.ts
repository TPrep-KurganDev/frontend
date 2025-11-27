import { api } from './api';

export interface ExamCreate {
  title: string;
}

export interface ExamOut {
  id: number;
  title: string;
  creator_id: number;
  created_at?: string;
}

export async function getExam(examId: number) {
  const res = await api.get<ExamOut>(`/exams/${examId}`);
  return res.data;
}

export async function getCreatedExams(creatorId: number) {
  const res = await api.get<ExamOut[]>('/exams/created', {
    params: { creator_id: creatorId },
  });
  return res.data;
}

export async function getPinnedExams(pinnedId: number) {
  const res = await api.get<ExamOut[]>('/exams/pinned', {
    params: { pinned_id: pinnedId },
  });
  return res.data;
}

export async function createExam(data: string) {
  const token = localStorage.getItem('accessToken');
  const res = await api.post<ExamOut>('/exams/', {'title': data}, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}

export async function updateExam(examId: number, data: ExamCreate) {
  const token = localStorage.getItem('accessToken');
  const res = await api.patch<ExamOut>(`/exams/${examId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}

export async function deleteExam(examId: number | undefined) {
  const token = localStorage.getItem('accessToken');
  await api.delete(`/exams/${examId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
}
