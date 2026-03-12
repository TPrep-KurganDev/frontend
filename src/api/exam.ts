import {api} from './api';
import {buildCacheKey} from '../offline/cacheKey';
import {readThroughCache} from '../offline/readThroughCache';
import {deleteCacheEntry, setCacheEntry} from '../offline/cacheDb';

export interface ExamCreate {
  title: string;
}

export interface ExamPinStatus {
  is_pinned: boolean;
}

export interface ExamOut {
  id: string;
  title: string;
  creator_id: string | null;
  created_at?: string;
}

function getPinnedStatusCacheKey(examId: string | undefined): string {
  return buildCacheKey('exams:isExamPinned', [examId]);
}

function getPinnedExamsCacheKey(userId: number): string {
  return buildCacheKey('exams:getPinnedExams', [userId]);
}

async function refreshPinCaches(examId: string | undefined, isPinned: boolean): Promise<void> {
  if (examId === undefined) {
    return;
  }

  const tasks: Array<Promise<unknown>> = [
    setCacheEntry(getPinnedStatusCacheKey(examId), {is_pinned: isPinned})
  ];

  const userId = Number(localStorage.getItem('userId'));
  if (!Number.isNaN(userId) && userId > 0) {
    tasks.push(deleteCacheEntry(getPinnedExamsCacheKey(userId)));
  }

  await Promise.allSettled(tasks);
}

export async function getExam(examId: string) {
  return readThroughCache(
    buildCacheKey('exams:getExam', [examId]),
    async () => (await api.get<ExamOut>(`/exams/${examId}`)).data
  );
}

export async function getCreatedExams(creatorId: string | null) {
  return readThroughCache(
    buildCacheKey('exams:getCreatedExams', [creatorId]),
    async () => (await api.get<ExamOut[]>('/exams/created', {
      params: {creator_id: creatorId},
    })).data
  );
}

export async function getPinnedExams(pinnedId: string | null) {
  return readThroughCache(
    buildCacheKey('exams:getPinnedExams', [pinnedId]),
    async () => (await api.get<ExamOut[]>('/exams/pinned', {
      params: {pinned_id: pinnedId},
    })).data
  );
}

export async function createExam(data: string) {
  const res = await api.post<ExamOut>('/exams', {'title': data});
  return res.data;
}

export async function updateExam(examId: string | undefined, data: ExamCreate) {
  const res = await api.patch<ExamOut>(`/exams/${examId}`, data);
  return res.data;
}

export async function deleteExam(examId: string | undefined) {
  await api.delete(`/exams/${examId}`);
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
