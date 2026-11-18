import express from 'express';
import {
  getRecentlyViewed,
  recordView,
  mergeGuestHistory,
  clearRecentlyViewed,
} from '../controllers/recentlyViewedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRecentlyViewed);
router.post('/merge', mergeGuestHistory);
router.post('/:productId', recordView);
router.delete('/', clearRecentlyViewed);

export default router;

