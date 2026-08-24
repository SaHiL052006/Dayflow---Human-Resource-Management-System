import api from './api';

/**
 * Leave API Service (Employee Self-Service & Admin Approvals)
 */

export const applyLeave = async (leaveData) => {
  return await api.post('/leaves', leaveData);
};

export const getMyLeaves = async () => {
  return await api.get('/leaves/me');
};

export const getAdminLeaves = async (status = 'All') => {
  return await api.get('/leaves/admin', { params: { status } });
};

export const updateLeaveStatus = async (id, statusData) => {
  return await api.patch(`/leaves/admin/${id}`, statusData);
};

export default {
  applyLeave,
  getMyLeaves,
  getAdminLeaves,
  updateLeaveStatus,
};
