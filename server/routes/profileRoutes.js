import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// GET /api/profile/me
router.get('/me', getMyProfile);

// PUT /api/profile/me (Employee restricted update)
router.put('/me', updateMyProfile);

export default router;
