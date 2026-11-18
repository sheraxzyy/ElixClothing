import express from 'express';
import {
  subscribeStockAlert,
  unsubscribeStockAlert,
  getAdminStockInsights,
} from '../controllers/stockNotificationController.js';
import { protect, admin, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', optionalProtect, subscribeStockAlert);
router.get('/unsubscribe', unsubscribeStockAlert);
router.get('/admin/insights', protect, admin, getAdminStockInsights);

export default router;

