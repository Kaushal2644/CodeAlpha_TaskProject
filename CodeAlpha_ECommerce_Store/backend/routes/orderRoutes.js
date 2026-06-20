import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, isSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// Buyer routes (all require authentication)
router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders); // legacy
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelMyOrder);

// Seller/Admin-style routes
router.get('/seller', protect, isSeller, getSellerOrders);
router.put('/:id/status', protect, isSeller, updateOrderStatus);

export default router;
