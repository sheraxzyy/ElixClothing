import express from 'express';
import { getAnalytics, exportOrdersCSV } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', getAnalytics);
router.get('/export-csv', exportOrdersCSV);

export default router;

