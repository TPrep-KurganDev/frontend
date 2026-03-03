import {api} from './api';
import {buildCacheKey} from '../offline/cacheKey';
import {readThroughCache} from '../offline/readThroughCache';
import {deleteCacheEntry, setCacheEntry} from '../offline/cacheDb';

export interface CardBase {
  question: string;
  answer: string;
}

export interface CardOut {
  question: string;
  answer: string;
  card_id: number
}

interface CardsListOptions {
  forceRefresh?: boolean;
}

function getCardsListCacheKey(examId: number): string {
  return buildCacheKey('cards:getCardsList', [examId]);
}

function getCardCacheKey(cardId: number): string {
  return buildCacheKey('cards:getCard', [cardId]);
}

export async function createCard(examId: number, data: CardBase) {
  const res = await api.post<CardOut>(`/exams/${examId}/cards`, data);
  let createdCard: CardOut = res.data;

  const backendIgnoredPayload =
    createdCard.question !== data.question ||
    createdCard.answer !== data.answer;

  if (backendIgnoredPayload) {
    try {
      const patched = await api.patch<Partial<CardOut>>(
        `/exams/${examId}/cards/${createdCard.card_id}`,
        data
      );

      createdCard = {
        ...createdCard,
        ...patched.data,
        card_id: createdCard.card_id
      };
    } catch {
      createdCard = {
        ...createdCard,
        question: data.question,
        answer: data.answer
      };
    }
  }

  await Promise.allSettled([
    deleteCacheEntry(getCardsListCacheKey(examId)),
    setCacheEntry(getCardCacheKey(createdCard.card_id), createdCard)
  ]);

  return createdCard;
}

export async function getCard(cardId: number): Promise<CardOut> {
  return readThroughCache(
    getCardCacheKey(cardId),
    async () => (await api.get<CardOut>(`/cards/${cardId}`)).data
  );
}

export async function updateCard(examId: number, cardId: number, data: CardBase) {
  const res = await api.patch(`/exams/${examId}/cards/${cardId}`, data);

  await Promise.allSettled([
    deleteCacheEntry(getCardsListCacheKey(examId)),
    deleteCacheEntry(getCardCacheKey(cardId))
  ]);

  return res.data;
}

export async function deleteCard(examId: number, cardId: number) {
  await api.delete(`/exams/${examId}/cards/${cardId}`);

  await Promise.allSettled([
    deleteCacheEntry(getCardsListCacheKey(examId)),
    deleteCacheEntry(getCardCacheKey(cardId))
  ]);
}

export async function getCardsList(examId: number, options?: CardsListOptions): Promise<CardOut[]> {
  const cards = await readThroughCache(
    getCardsListCacheKey(examId),
    async () => (await api.get<CardOut[]>(`/exams/${examId}/cards`)).data,
    {preferCache: !(options?.forceRefresh ?? false)}
  );

  void Promise.allSettled(
    cards.map((card) => setCacheEntry(getCardCacheKey(card.card_id), card))
  );

  return cards;
}
