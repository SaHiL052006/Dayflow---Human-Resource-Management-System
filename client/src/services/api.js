import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Pre-configured Axios instance for Dayflow HRMS API
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dayflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Standardize responses & catch errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      message = 'Cannot connect to Dayflow backend server at http://localhost:5000. Please make sure the server is running (cd server && npm run dev).';
    } else if (error.message) {
      message = error.message;
    }

    const customError = {
      message,
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };
    return Promise.reject(customError);
  }
);

export default api;
