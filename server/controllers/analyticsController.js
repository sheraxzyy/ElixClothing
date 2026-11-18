import asyncHandler from 'express-async-handler';
import analyticsService from '../services/AnalyticsService.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const { filter, startDate, endDate } = req.query;
  const data = await analyticsService.getDashboardAnalytics({ filter, startDate, endDate });
  res.json(data);
});

export const exportOrdersCSV = asyncHandler(async (req, res) => {
  const { filter, startDate, endDate } = req.query;
  const csv = await analyticsService.generateOrdersCSV({ filter, startDate, endDate });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="elix_orders_report_${Date.now()}.csv"`
  );
  res.status(200).send(csv);
});

