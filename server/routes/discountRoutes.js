import express from 'express';
import {
  createDiscount,
  getDiscounts,
  updateDiscount,
  deleteDiscount,
} from '../controllers/discountController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getDiscounts);
router.post('/', protect, admin, createDiscount);
router.put('/:id', protect, admin, updateDiscount);
router.delete('/:id', protect, admin, deleteDiscount);

export default router;
