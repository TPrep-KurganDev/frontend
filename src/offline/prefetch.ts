import {getCardsList} from '../api/cards';
import {ExamOut, getCreatedExams, getPinnedExams} from '../api/exam';
import {getNotifications, NotificationOut} from '../api/notifications';
import {getUserById} from '../api/users';
import {buildCacheKey} from './cacheKey';
import {setCacheEntry} from './cacheDb';

const cardsPrefetchInFlight = new Map<number, Promise<void>>();
const userPrefetchInFlight = new Map<number, Promise<void>>();

async function prefetchCardsForExam(examId: number): Promise<void> {
  const existing = cardsPrefetchInFlight.get(examId);
  if (existing) {
    return existing;
  }

  const task = getCardsList(examId)
    .then((cards) => {
      void Promise.allSettled(cards.map((card) => setCacheEntry(
        buildCacheKey('cards:getCard', [card.card_id]),
        card
      )));
    })
    .catch(() => undefined)
    .finally(() => {
      cardsPrefetchInFlight.delete(examId);
    });

  cardsPrefetchInFlight.set(examId, task);
  return task;
}

async function prefetchUserName(userId: number): Promise<void> {
  const existing = userPrefetchInFlight.get(userId);
  if (existing) {
    return existing;
  }

  const task = getUserById(userId)
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      userPrefetchInFlight.delete(userId);
    });

  userPrefetchInFlight.set(userId, task);
  return task;
}

export async function prefetchExamGraph(exams: ExamOut[]): Promise<void> {
  await Promise.allSettled(exams.map(async (exam) => {
    await setCacheEntry(buildCacheKey('exams:getExam', [exam.id]), exam).catch(() => undefined);
    await Promise.allSettled([
      prefetchCardsForExam(exam.id),
      prefetchUserName(exam.creator_id)
    ]);
  }));
}

export async function prefetchCreatedExamsGraph(userId: number): Promise<ExamOut[]> {
  const exams = await getCreatedExams(userId);
  await prefetchExamGraph(exams);
  return exams;
}

export async function prefetchPinnedExamsGraph(userId: number): Promise<ExamOut[]> {
  const exams = await getPinnedExams(userId);
  await prefetchExamGraph(exams);
  return exams;
}

export async function prefetchNotificationsForUser(): Promise<NotificationOut[]> {
  return getNotifications();
}
