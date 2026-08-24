import api from './api';

/**
 * Health check API service
 */
export const fetchHealthStatus = async () => {
  return await api.get('/health');
};

export default {
  fetchHealthStatus,
};
