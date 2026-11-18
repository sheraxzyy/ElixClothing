import asyncHandler from 'express-async-handler';
import stockNotificationService from '../services/StockNotificationService.js';

export const subscribeStockAlert = asyncHandler(async (req, res) => {
  const { email, productId, size, color } = req.body;
  const userId = req.user?.id || null;

  const result = await stockNotificationService.subscribe({
    email,
    productId,
    size,
    color,
    userId,
  });

  res.status(201).json(result);
});

export const unsubscribeStockAlert = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400);
    throw new Error('Subscription ID is required to unsubscribe.');
  }

  await stockNotificationService.unsubscribe(id);
  res.send(`
    <div style="font-family:sans-serif; text-align:center; padding:50px; background:#111; color:#eee;">
      <h1 style="color:#d4ff00;">ELIX // RESTOCK ALERTS</h1>
      <p>You have successfully unsubscribed from this restock notification.</p>
      <a href="/" style="color:#fff; text-decoration:underline;">Back to ELIX Store</a>
    </div>
  `);
});

export const getAdminStockInsights = asyncHandler(async (req, res) => {
  const insights = await stockNotificationService.getAdminStockInsights();
  res.json(insights);
});

