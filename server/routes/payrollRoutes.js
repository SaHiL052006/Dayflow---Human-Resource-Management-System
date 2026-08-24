import express from 'express';
import {
  getMyPayroll,
  getAdminPayroll,
  updateEmployeePayroll,
} from '../controllers/payrollController.js';
import { protect, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All payroll routes require authentication
router.use(protect);

router.get('/me', getMyPayroll);
router.get('/admin', roleMiddleware(['admin']), getAdminPayroll);
router.put('/admin/:id', roleMiddleware(['admin']), updateEmployeePayroll);

export default router;
