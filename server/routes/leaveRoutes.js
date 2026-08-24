import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAdminLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.js';
import { protect, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All leave routes require user authentication
router.use(protect);

// Employee leave endpoints
router.post('/', applyLeave);
router.get('/me', getMyLeaves);

// Admin leave management endpoints
router.get('/admin', roleMiddleware(['admin']), getAdminLeaves);
router.patch('/admin/:id', roleMiddleware(['admin']), updateLeaveStatus);

export default router;
