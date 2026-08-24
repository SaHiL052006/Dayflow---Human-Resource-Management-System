import api from './api';

/**
 * Payroll API Service (Personal Compensation & Admin Payroll Engine)
 */

export const getMyPayroll = async () => {
  return await api.get('/payroll/me');
};

export const getAdminPayroll = async () => {
  return await api.get('/payroll/admin');
};

export const updateEmployeePayroll = async (id, salaryData) => {
  return await api.put(`/payroll/admin/${id}`, salaryData);
};

export default {
  getMyPayroll,
  getAdminPayroll,
  updateEmployeePayroll,
};
