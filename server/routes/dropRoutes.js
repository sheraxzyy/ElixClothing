import express from 'express';
import {
  getPublicDrops,
  getDropById,
  getAllDropsAdmin,
  createDrop,
  updateDrop,
  deleteDrop,
} from '../controllers/dropController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPublicDrops);
router.get('/:slugOrId', getDropById);

router.get('/admin/all', protect, admin, getAllDropsAdmin);
router.post('/', protect, admin, createDrop);
router.put('/:id', protect, admin, updateDrop);
router.delete('/:id', protect, admin, deleteDrop);

export default router;

