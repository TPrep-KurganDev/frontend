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

export async function createExam(data: ExamCreate) {
  const res = await api.post<ExamOut>('/exams/', data);
  return res.data;
}

export async function updateExam(examId: number, data: ExamCreate) {
  const res = await api.patch<ExamOut>(`/exams/${examId}`, data);
  return res.data;
}

export async function deleteExam(examId: number) {
  await api.delete(`/exams/${examId}`);
}
