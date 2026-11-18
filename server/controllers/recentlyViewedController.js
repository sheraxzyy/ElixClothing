import asyncHandler from 'express-async-handler';
import recentlyViewedService from '../services/RecentlyViewedService.js';

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const history = await recentlyViewedService.getUserRecentlyViewed(userId);
  res.json(history);
});

export const recordView = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const record = await recentlyViewedService.recordView(userId, productId);
  res.json(record);
});

export const mergeGuestHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productIds } = req.body;
  const history = await recentlyViewedService.mergeGuestHistory(userId, productIds);
  res.json(history);
});

export const clearRecentlyViewed = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await recentlyViewedService.clearUserHistory(userId);
  res.json({ message: 'Viewing history cleared' });
});

