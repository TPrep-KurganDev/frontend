import { api } from './api';

export interface CardBase {
  question: string;
  answer: string;
}

export async function createCard(examId: number, data: CardBase) {
  const res = await api.post(`/exams/${examId}/cards`, data);
  return res.data;
}

export async function getCard(examId: number, cardId: number): Promise<CardBase> {
  const res = await api.get<CardBase>(`/exams/${examId}/cards/${cardId}`);
  return res.data;
}

export async function updateCard(examId: number, cardId: number, data: CardBase) {
  const res = await api.patch(`/exams/${examId}/cards/${cardId}`, data);
  return res.data;
}

export async function deleteCard(examId: number, cardId: number) {
  await api.delete(`/exams/${examId}/cards/${cardId}`);
}
