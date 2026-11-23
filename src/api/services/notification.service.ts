import { http } from '../client';
import { AppNotification } from '../types';

/** Notifications — shared by every role. */
export const notificationService = {
  list: (unreadOnly = false) =>
    http.get<{ items: AppNotification[]; unread: number }>('/api/notifications', { unread: unreadOnly || undefined }),
  markRead: (id: number) => http.patch<unknown>(`/api/notifications/${id}/read`),
  markAllRead: () => http.patch<unknown>('/api/notifications/read-all'),
};

/** Video call join info (the live call itself uses Socket.io + WebRTC). */
export const videoService = {
  joinInfo: (appointmentId: number) => http.get<any>(`/api/video/appointments/${appointmentId}/join-info`),
};
