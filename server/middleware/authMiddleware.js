import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware to verify JWT and authenticate request
 */
export const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const jwtSecret = process.env.JWT_SECRET || 'dayflow_default_jwt_secret';
      const decoded = jwt.verify(token, jwtSecret);

      // Attach authenticated user to request
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return errorResponse(res, 'User belonging to this token no longer exists', 401);
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Authentication token has expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication token. Authorization denied.', 401);
    }
  }

  if (!token) {
    return errorResponse(res, 'Authorization token missing. Please provide a Bearer token.', 401);
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 * @param {string[]|string} allowedRoles - Single role or array of allowed roles
 */
export const roleMiddleware = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before checking permissions', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' does not have permission to perform this action. Required: [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

export const protect = authMiddleware;
export const authorize = roleMiddleware;
