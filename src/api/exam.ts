import {api} from './api';
import {buildCacheKey} from '../offline/cacheKey';
import {readThroughCache} from '../offline/readThroughCache';
import {deleteCacheEntry, setCacheEntry} from '../offline/cacheDb';

export interface ExamCreate {
  title: string | undefined;
  scope: string
}

export interface ExamPinStatus {
  is_pinned: boolean;
}

export interface ExamOut {
  id: string;
  title: string;
  scope: string
  creator_id: string | null;
  created_at?: string;
}

interface ExamReadOptions {
  forceRefresh?: boolean;
}

function getPinnedStatusCacheKey(examId: string | undefined): string {
  return buildCacheKey('exams:isExamPinned', [examId]);
}

function getExamCacheKey(examId: string): string {
  return buildCacheKey('exams:getExam', [examId]);
}

function getCreatedExamsCacheKey(userId: string | null): string {
  return buildCacheKey('exams:getCreatedExams', [userId]);
}

function getPinnedExamsCacheKey(userId: string | null): string {
  return buildCacheKey('exams:getPinnedExams', [userId]);
}

function shouldForceRefresh(options?: ExamReadOptions): boolean {
  if (typeof options?.forceRefresh === 'boolean') {
    return options.forceRefresh;
  }

  return typeof navigator === 'undefined' || navigator.onLine;
}

async function invalidateExamListsForCurrentUser(): Promise<void> {
  const userId = localStorage.getItem('userId');
  await Promise.allSettled([
    deleteCacheEntry(getCreatedExamsCacheKey(userId)),
    deleteCacheEntry(getPinnedExamsCacheKey(userId))
  ]);
}


async function refreshPinCaches(examId: string | undefined, isPinned: boolean): Promise<void> {
  if (examId === undefined) {
    return;
  }

  const tasks: Array<Promise<unknown>> = [
    setCacheEntry(getPinnedStatusCacheKey(examId), {is_pinned: isPinned})
  ];

  const userId = localStorage.getItem('userId');
  tasks.push(deleteCacheEntry(getPinnedExamsCacheKey(userId)));

  await Promise.allSettled(tasks);
}

export async function getExam(examId: string) {
  return readThroughCache(
    getExamCacheKey(examId),
    async () => (await api.get<ExamOut>(`/exams/${examId}`)).data,
    {preferCache: !shouldForceRefresh()}
  );
}

export async function getCreatedExams(creatorId: string | null, options?: ExamReadOptions) {
  return readThroughCache(
    getCreatedExamsCacheKey(creatorId),
    async () => (await api.get<ExamOut[]>('/exams/created', {
      params: {creator_id: creatorId},
    })).data,
    {preferCache: !shouldForceRefresh(options)}
  );
}

export async function getPinnedExams(pinnedId: string | null, options?: ExamReadOptions) {
  return readThroughCache(
    getPinnedExamsCacheKey(pinnedId),
    async () => (await api.get<ExamOut[]>('/exams/pinned', {
      params: {pinned_id: pinnedId},
    })).data,
    {preferCache: !shouldForceRefresh(options)}
  );
}

export async function createExam(title: string, scope = 'default') {
  const res = await api.post<ExamOut>('/exams', {title, scope});
  await Promise.allSettled([
    setCacheEntry(getExamCacheKey(res.data.id), res.data),
    invalidateExamListsForCurrentUser()
  ]);
  return res.data;
}

export async function updateExam(examId: string | undefined, data: ExamCreate) {
  const res = await api.patch<ExamOut>(`/exams/${examId}`, data);
  await Promise.allSettled([
    setCacheEntry(getExamCacheKey(res.data.id), res.data),
    invalidateExamListsForCurrentUser()
  ]);
  return res.data;
}

export async function deleteExam(examId: string | undefined) {
  await api.delete(`/exams/${examId}`);

  if (examId === undefined) {
    return;
  }

  await Promise.allSettled([
    deleteCacheEntry(getExamCacheKey(examId)),
    invalidateExamListsForCurrentUser()
  ]);
}

export async function pinExam(examId: string | undefined) {
  await api.post(`/exams/${examId}/pin`);
  await refreshPinCaches(examId, true);
}

export async function unpinExam(examId: string | undefined) {
  await api.post(`/exams/${examId}/unpin`);
  await refreshPinCaches(examId, false);
}

export async function isExamPinned(examId: string | undefined) {
  if (examId === undefined) {
    return {is_pinned: false};
  }

  const userId = Number(localStorage.getItem('userId'));
  if (Number.isNaN(userId) || userId <= 0) {
    return {is_pinned: false};
  }

  return readThroughCache(
    getPinnedStatusCacheKey(examId),
    async () => {
      const pinnedExams = (await api.get<ExamOut[]>('/exams/pinned', {
        params: {pinned_id: userId}
      })).data;
      return {is_pinned: pinnedExams.some((exam) => exam.id === examId)};
    }
  );
}

export async function uploadCardsFile(examId: number | undefined, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  await api.post(
    `/exams/${examId}/cards/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
}

export async function searchExams(searchString: string) {
  const res = await api.get<ExamOut[]>('/exams/search', {
    params: { 'searched': searchString },
  });
  return res.data;
}
