import {api} from './api';
import {getCachedCardsList} from './cards';
import {buildCacheKey} from '../offline/cacheKey';
import {readThroughCache} from '../offline/readThroughCache';
import {getCacheEntry, setCacheEntry} from '../offline/cacheDb';
import {getWarmCardsForExam} from '../offline/warmCardsCache';

export interface ExamSessionStartRequest {
  exam_id: number | undefined
  strategy: string
  n: number | null
}

export type Answers = {
  [key: number]: boolean;
};

export interface ExamSessionResponse {
  id: string
  questions: number[]
  answers: Answers
  exam_id: number
  offline_cards?: Record<number, { question: string; answer: string }>
}

const OFFLINE_SESSION_ID_PREFIX = 'offline-session-';

function getSessionCacheKey(sessionId: string | null): string {
  return buildCacheKey('sessions:getSession', [sessionId ?? 'null']);
}

function isOfflineSessionId(sessionId: string | null | undefined): sessionId is string {
  return typeof sessionId === 'string' && sessionId.startsWith(OFFLINE_SESSION_ID_PREFIX);
}

function isOfflineLikeError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeAxiosError = error as {
    code?: string;
    response?: { status?: number };
    request?: unknown;
  };

  if (maybeAxiosError.code === 'ERR_NETWORK') {
    return true;
  }

  return maybeAxiosError.code === 'OFFLINE_MUTATION_BLOCKED';
}

function isSessionResponse(data: unknown): data is ExamSessionResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const session = data as Partial<ExamSessionResponse>;
  const answers = session.answers as unknown;

  return (
    typeof session.id === 'string' &&
    typeof session.exam_id === 'number' &&
    Array.isArray(session.questions) &&
    !!answers &&
    typeof answers === 'object' &&
    !Array.isArray(answers)
  );
}

function shuffleIds(items: number[]): number[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function selectQuestionsForOfflineSession(
  cardsIds: number[],
  strategy: string,
  n: number | null
): number[] {
  const normalizedStrategy = strategy.trim().toLowerCase();

  if (normalizedStrategy === 'random') {
    const maxCount = cardsIds.length;
    const desiredCount = Math.max(1, Math.min(n ?? maxCount, maxCount));
    return shuffleIds(cardsIds).slice(0, desiredCount);
  }

  if (normalizedStrategy === 'smart') {
    // Smart strategy requires backend history, so offline fallback is shuffled full exam.
    return shuffleIds(cardsIds);
  }

  return cardsIds;
}

async function createOfflineSession(data: ExamSessionStartRequest): Promise<ExamSessionResponse> {
  if (!data.exam_id) {
    throw new Error('exam_id is required');
  }

  const warmCards = getWarmCardsForExam(data.exam_id);
  const cards = warmCards.length > 0
    ? warmCards
    : await getCachedCardsList(data.exam_id);
  const cardsIds = cards.map((card) => card.card_id);

  if (cardsIds.length === 0) {
    const offlineDataError = new Error('No cached questions available for offline session');
    (offlineDataError as Error & { code?: string }).code = 'OFFLINE_SESSION_DATA_UNAVAILABLE';
    throw offlineDataError;
  }

  const offlineSession: ExamSessionResponse = {
    id: `${OFFLINE_SESSION_ID_PREFIX}${Date.now()}`,
    exam_id: data.exam_id,
    questions: selectQuestionsForOfflineSession(cardsIds, data.strategy, data.n),
    answers: {},
    offline_cards: cards.reduce<Record<number, { question: string; answer: string }>>((acc, card) => {
      acc[card.card_id] = {
        question: card.question,
        answer: card.answer
      };
      return acc;
    }, {})
  };

  await setCacheEntry(getSessionCacheKey(offlineSession.id), offlineSession);
  return offlineSession;
}

export async function createSessionOffline(data: ExamSessionStartRequest) {
  return createOfflineSession(data);
}

export async function getSession(session_id: string | null) {
  if (isOfflineSessionId(session_id)) {
    const cachedSession = await getCacheEntry<ExamSessionResponse>(getSessionCacheKey(session_id));
    if (cachedSession) {
      return cachedSession.value;
    }
    throw new Error('Offline session is not available');
  }

  return readThroughCache(
    getSessionCacheKey(session_id),
    async () => (await api.get<ExamSessionResponse>(`/session/${session_id}`)).data
  );
}

export async function createSession(data: ExamSessionStartRequest) {
  const browserOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (browserOffline) {
    return createOfflineSession(data);
  }

  try {
    const res = await api.post<ExamSessionResponse>('/session/', data, {
      headers: {
        'x-suppress-offline-toast': '1'
      }
    });

    if (!isSessionResponse(res.data)) {
      throw new Error('Unexpected createSession response');
    }

    await setCacheEntry(getSessionCacheKey(res.data.id), res.data);
    return res.data;
  } catch (error) {
    if (!isOfflineLikeError(error)) {
      throw error;
    }

    return createOfflineSession(data);
  }
}

export async function answerQuestion(session_id: string, question_id: number, value: boolean) {
  if (isOfflineSessionId(session_id)) {
    const cachedSession = await getCacheEntry<ExamSessionResponse>(getSessionCacheKey(session_id));
    if (!cachedSession) {
      throw new Error('Offline session is not available');
    }

    const updatedSession: ExamSessionResponse = {
      ...cachedSession.value,
      answers: {
        ...cachedSession.value.answers,
        [question_id]: value
      }
    };

    await setCacheEntry(getSessionCacheKey(session_id), updatedSession);
    return updatedSession;
  }

  const res = await api.post<unknown>(`/session/${session_id}/answer?question_id=${question_id}&value=${value}`);
  if (isSessionResponse(res.data)) {
    await setCacheEntry(getSessionCacheKey(session_id), res.data);
    return res.data;
  }

  try {
    const fresh = await api.get<unknown>(`/session/${session_id}`);
    if (isSessionResponse(fresh.data)) {
      await setCacheEntry(getSessionCacheKey(session_id), fresh.data);
      return fresh.data;
    }
  } catch {
    // Ignore; fallback to local cache update below.
  }

  const cachedSession = await getCacheEntry<ExamSessionResponse>(getSessionCacheKey(session_id));
  if (cachedSession && isSessionResponse(cachedSession.value)) {
    const updatedSession: ExamSessionResponse = {
      ...cachedSession.value,
      answers: {
        ...cachedSession.value.answers,
        [question_id]: value
      }
    };

    await setCacheEntry(getSessionCacheKey(session_id), updatedSession);
    return updatedSession;
  }

  const fallbackSession: ExamSessionResponse = {
    id: session_id,
    exam_id: 0,
    questions: [],
    answers: {
      [question_id]: value
    }
  };
  await setCacheEntry(getSessionCacheKey(session_id), fallbackSession);
  return fallbackSession;
}
