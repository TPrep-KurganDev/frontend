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
  const token = localStorage.getItem('accessToken');
  const res = await api.post<CardOut>(`/exams/${examId}/cards`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}

export async function getCard(cardId: number): Promise<CardOut> {
  const res = await api.get<CardOut>(`/cards/${cardId}`);
  return res.data;
}

export async function updateCard(examId: number, cardId: number, data: CardBase) {
  const token = localStorage.getItem('accessToken');
  const res = await api.patch(`/exams/${examId}/cards/${cardId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
  return res.data;
}

export async function deleteCard(examId: number, cardId: number) {
  const token = localStorage.getItem('accessToken');
  await api.delete(`/exams/${examId}/cards/${cardId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
}

export async function getCardsList(examId: number): Promise<CardOut[]> {
  const res = await api.get<CardOut[]>(`/exams/${examId}/cards/`);
  return res.data;
}
