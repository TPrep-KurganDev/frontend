import { api } from './api';

export interface CardBase {
  question: string;
  answer: string;
}

export interface CardOut {
  question: string;
  answer: string;
  card_id: number
}

export async function createCard(examId: number, data: CardBase) {
  const res = await api.post<CardOut>(`/exams/${examId}/cards`, data);
  return res.data;
}

export async function getCard(cardId: number): Promise<CardOut> {
  const res = await api.get<CardOut>(`/cards/${cardId}`);
  return res.data;
}

export async function updateCard(examId: number, cardId: number, data: CardBase) {
  const res = await api.patch(`/exams/${examId}/cards/${cardId}`, data);
  return res.data;
}

export async function deleteCard(examId: number, cardId: number) {
  await api.delete(`/exams/${examId}/cards/${cardId}`);
}

export async function getCardsList(examId: number): Promise<CardOut[]> {
  const res = await api.get<CardOut[]>(`/exams/${examId}/cards`);
  return res.data;
}
