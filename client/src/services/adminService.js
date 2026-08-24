import api from './api';

/**
 * Admin HRMS API Service
 */

export const getEmployees = async () => {
  return await api.get('/admin/employees');
};

export const getAdminStats = async () => {
  return await api.get('/admin/stats');
};

export const getEmployeeById = async (id) => {
  return await api.get(`/admin/employees/${id}`);
};

export const updateEmployee = async (id, employeeData) => {
  return await api.put(`/admin/employees/${id}`, employeeData);
};

export default {
  getEmployees,
  getAdminStats,
  getEmployeeById,
  updateEmployee,
};
