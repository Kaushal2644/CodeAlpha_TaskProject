import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getProductAverageRating,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/average', getProductAverageRating);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
