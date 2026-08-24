import express from 'express';
import {
  getEmployees,
  getAdminStats,
  getEmployeeById,
  updateEmployee,
} from '../controllers/adminController.js';
import { protect, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require JWT authentication and 'admin' role
router.use(protect);
router.use(roleMiddleware(['admin']));

// GET /api/admin/employees
router.get('/employees', getEmployees);

// GET /api/admin/stats
router.get('/stats', getAdminStats);

// GET /api/admin/employees/:id
router.get('/employees/:id', getEmployeeById);

// PUT /api/admin/employees/:id (Admin full update)
router.put('/employees/:id', updateEmployee);

export default router;
