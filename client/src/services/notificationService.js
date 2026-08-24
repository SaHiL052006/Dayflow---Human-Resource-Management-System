import api from './api';

/**
 * Notification API Service (In-App Alerts & Activity Feeds)
 */

export const getMyNotifications = async () => {
  return await api.get('/notifications/me');
};

export const markAsRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  return await api.patch('/notifications/read-all');
};

export default {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
