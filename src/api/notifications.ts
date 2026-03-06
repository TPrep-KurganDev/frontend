import {api} from './api';
import {buildCacheKey} from '../offline/cacheKey';
import {readThroughCache} from '../offline/readThroughCache';

export interface NotificationOut {
  id: number;
  exam_title: string;
  time: string;
}

export async function getNotifications() {
  return readThroughCache(
    buildCacheKey('notifications:getNotifications'),
    async () => (await api.get<NotificationOut[]>('/notifications')).data
  );
}

export async function deleteNotification(notificationId: number) {
  await api.delete(`/notifications/${notificationId}`);
}
