import express from 'express';
import {
  signup,
  verifyEmail,
  login,
  getMe,
  logout,
} from '../controllers/authController.js';
import { protect, roleMiddleware } from '../middleware/authMiddleware.js';
import { successResponse } from '../utils/response.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

// Admin-only test/verification endpoint
router.get('/admin-check', protect, roleMiddleware(['admin']), (req, res) => {
  return successResponse(res, 'Admin authorization confirmed', {
    user: req.user,
    accessLevel: 'admin',
  });
});

export default router;
