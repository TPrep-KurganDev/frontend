import {createSession, ExamSessionResponse, ExamSessionStartRequest} from '../api/session';
import {CardOut, getCardsList} from '../api/cards';

const pendingSessionStarts = new Map<string, Promise<ExamSessionResponse>>();
const preparedSessions = new Map<string, ExamSessionResponse>();
const preparedSessionCards = new Map<string, Record<number, { question: string; answer: string }>>();

function makePendingStartId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function schedulePreparedSessionCleanup(sessionId: string): void {
  setTimeout(() => {
    preparedSessions.delete(sessionId);
    preparedSessionCards.delete(sessionId);
  }, 60_000);
}

function toCardsMap(cards: CardOut[]): Record<number, { question: string; answer: string }> {
  return cards.reduce<Record<number, { question: string; answer: string }>>((acc, card) => {
    acc[card.card_id] = {
      question: card.question,
      answer: card.answer
    };
    return acc;
  }, {});
}

export function beginPendingSessionStart(request: ExamSessionStartRequest): string {
  const pendingId = makePendingStartId();
  const sessionPromise = createSession(request);

  pendingSessionStarts.set(pendingId, sessionPromise);
  void sessionPromise.then((session) => {
    preparedSessions.set(session.id, session);
    schedulePreparedSessionCleanup(session.id);

    void getCardsList(session.exam_id)
      .then((cards) => {
        preparedSessionCards.set(session.id, toCardsMap(cards));
      })
      .catch(() => undefined);
  }).catch(() => undefined);

  void sessionPromise.finally(() => {
    setTimeout(() => {
      pendingSessionStarts.delete(pendingId);
    }, 60_000);
  });

  return pendingId;
}

export function getPendingSessionStart(pendingId: string): Promise<ExamSessionResponse> | undefined {
  return pendingSessionStarts.get(pendingId);
}

export function clearPendingSessionStart(pendingId: string): void {
  pendingSessionStarts.delete(pendingId);
}

export function takePreparedSession(sessionId: string): ExamSessionResponse | undefined {
  const session = preparedSessions.get(sessionId);
  preparedSessions.delete(sessionId);
  return session;
}

export function takePreparedSessionCards(sessionId: string): Record<number, { question: string; answer: string }> {
  const cardsMap = preparedSessionCards.get(sessionId) ?? {};
  preparedSessionCards.delete(sessionId);
  return cardsMap;
}
