import {api} from './api';

export interface NotificationOut {
  id: number;
  exam_title: string;
  time: string;
}

export async function getNotifications() {
  const res = await api.get<NotificationOut[]>('/notifications');
  return res.data;
}

export async function deleteNotification(notificationId: number) {
  await api.delete(`/notifications/${notificationId}`);
}
