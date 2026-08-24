import api from './api';

/**
 * Authentication API Service
 */

export const signup = async (userData) => {
  return await api.post('/auth/signup', userData);
};

export const login = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const verifyEmail = async (token) => {
  return await api.get(`/auth/verify/${token}`);
};

export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};

export const logout = async () => {
  try {
    return await api.post('/auth/logout');
  } catch (error) {
    // Ignore server error on logout
    return null;
  }
};

export default {
  signup,
  login,
  verifyEmail,
  getCurrentUser,
  logout,
};
