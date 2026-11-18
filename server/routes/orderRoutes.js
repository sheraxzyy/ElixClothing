import express from 'express';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  getOrderTracking,
  updateOrderTracking,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalProtect, createOrder);
router.get('/', protect, getOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/tracking', protect, getOrderTracking);

router.put('/:id/tracking', protect, admin, updateOrderTracking);
router.patch('/:id/tracking', protect, admin, updateOrderTracking);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.patch('/:id/status', protect, admin, updateOrderStatus);
router.delete('/:id', protect, admin, deleteOrder);

export default router;
