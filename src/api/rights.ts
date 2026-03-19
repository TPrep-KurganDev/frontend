import { api } from './api';
import { buildCacheKey } from '../offline/cacheKey';
import { readThroughCache } from '../offline/readThroughCache';

export interface ExamRightsResponse {
  user_id: string[];
}

export async function grantEditorRights(
  examId: string | null,
  targetUserId: string
): Promise<void> {
  await api.post(`/exams/${examId}/rights`, null, {
    params: { user_id: targetUserId },
  });
}

export async function changeUserRights(
  examId: string,
  targetUserId: string,
  rights: 'editor' | 'viewer'
): Promise<ExamRightsResponse> {
  const response = await api.patch<ExamRightsResponse>(
    `/exams/${examId}/rights`,
    null,
    {
      params: { user_id: targetUserId, rights },
    }
  );
  return response.data;
}

export async function revokeUserRights(
  examId: string | null,
  targetUserId: string
): Promise<void> {
  await api.delete(`/exams/${examId}/rights`, {
    params: { user_id: targetUserId },
  });
}

export async function getExamEditors(
  examId: string | null
): Promise<ExamRightsResponse> {
  return (await api.get<ExamRightsResponse>(`/exams/${examId}/rights`)).data;
}
