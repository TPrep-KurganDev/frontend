import type {CardOut} from '../api/cards';

const warmCardsByExam = new Map<string, CardOut[]>();

export function setWarmCardsForExam(examId: string, cards: CardOut[]): void {
  if (cards.length === 0) {
    return;
  }

  warmCardsByExam.set(examId, cards);
}

export function getWarmCardsForExam(examId: string): CardOut[] {
  return warmCardsByExam.get(examId) ?? [];
}
