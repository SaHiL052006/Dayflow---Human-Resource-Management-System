import { errorResponse } from '../utils/response.js';

/**
 * 404 Not Found Middleware for unhandled API routes
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Resource not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'Internal Server Error';

  console.error(`[API Error] ${req.method} ${req.originalUrl} - ${message}`);
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack, details: err.errors } : null
  );
};
