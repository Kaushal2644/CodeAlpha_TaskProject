import express from 'express';
import {
  register,
  login,
  getMe,
  becomeSeller,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/become-seller', protect, becomeSeller);

export default router;
