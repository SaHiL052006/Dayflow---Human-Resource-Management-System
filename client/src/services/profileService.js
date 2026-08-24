import api from './api';

/**
 * Profile API Service (Employee Self-Service)
 */

export const getMyProfile = async () => {
  return await api.get('/profile/me');
};

export const updateMyProfile = async (profileData) => {
  return await api.put('/profile/me', profileData);
};

export default {
  getMyProfile,
  updateMyProfile,
};
