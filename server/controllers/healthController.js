import mongoose from 'mongoose';
import { successResponse } from '../utils/response.js';

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Health check controller
 * @route GET /api/health
 */
export const getHealthStatus = (req, res) => {
  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = DB_STATES[dbStateCode] || 'unknown';
  const memoryUsage = process.memoryUsage();

  const healthData = {
    service: 'Dayflow HRMS Backend API',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'none',
      name: mongoose.connection.name || 'dayflow_hrms',
    },
    memory: {
      rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
      heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
    },
  };

  return successResponse(res, 'Dayflow API service is operational', healthData);
};
