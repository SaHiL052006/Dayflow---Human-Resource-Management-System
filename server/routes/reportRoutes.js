import express from 'express';
import {
  getAttendanceSummary,
  getLeaveSummary,
  getSalarySlip,
} from '../controllers/reportController.js';
import { protect, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All analytics & report routes are admin protected
router.use(protect);
router.use(roleMiddleware(['admin']));

router.get('/attendance-summary', getAttendanceSummary);
router.get('/leave-summary', getLeaveSummary);
router.get('/salary-slip/:employeeId', getSalarySlip);

export default router;
