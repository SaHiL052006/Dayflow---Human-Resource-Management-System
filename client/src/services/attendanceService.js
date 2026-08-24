import api from './api';

/**
 * Attendance API Service (Employee Self-Service & Admin Monitoring)
 */

export const checkIn = async () => {
  return await api.post('/attendance/checkin');
};

export const checkOut = async () => {
  return await api.post('/attendance/checkout');
};

export const getMyAttendance = async (range = 'weekly') => {
  return await api.get(`/attendance/me?range=${range}`);
};

export const getTodayStatus = async () => {
  return await api.get('/attendance/today-status');
};

export const getAdminAttendance = async (params = {}) => {
  return await api.get('/attendance/admin', { params });
};

export default {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayStatus,
  getAdminAttendance,
};
