import api from './api';

/**
 * Analytics & Reports API Service (Attendance analytics, Leave metrics, Salary slip generator)
 */

export const getAttendanceSummary = async (params = {}) => {
  return await api.get('/admin/reports/attendance-summary', { params });
};

export const getLeaveSummary = async () => {
  return await api.get('/admin/reports/leave-summary');
};

export const getSalarySlip = async (employeeId, month = 'August 2026') => {
  return await api.get(`/admin/reports/salary-slip/${employeeId}`, {
    params: { month },
  });
};

export default {
  getAttendanceSummary,
  getLeaveSummary,
  getSalarySlip,
};
