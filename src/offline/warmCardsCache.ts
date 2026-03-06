import type {CardOut} from '../api/cards';

const warmCardsByExam = new Map<number, CardOut[]>();

export function setWarmCardsForExam(examId: number, cards: CardOut[]): void {
  if (cards.length === 0) {
    return;
  }

  warmCardsByExam.set(examId, cards);
}

export function getWarmCardsForExam(examId: number): CardOut[] {
  return warmCardsByExam.get(examId) ?? [];
}
