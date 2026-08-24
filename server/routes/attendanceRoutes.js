import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayStatus,
  getAdminAttendance,
} from '../controllers/attendanceController.js';
import { protect, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All attendance routes require user authentication
router.use(protect);

// Employee attendance endpoints
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/me', getMyAttendance);
router.get('/today-status', getTodayStatus);

// Admin-only attendance management endpoint
router.get('/admin', roleMiddleware(['admin']), getAdminAttendance);

export default router;
