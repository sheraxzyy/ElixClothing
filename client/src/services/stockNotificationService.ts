import api from './api';
import { StockNotificationType } from '../types';

export const subscribeStockAlert = async (payload: {
  email: string;
  productId: string;
  size: string;
  color?: string;
}): Promise<{ message: string; subscription: StockNotificationType }> => {
  const res = await api.post('/stock-notifications/subscribe', payload);
  return res.data;
};

export const getAdminStockInsights = async (): Promise<{
  subscriptions: StockNotificationType[];
  demand: Array<{
    productId: string;
    size: string;
    count: number;
    product: { id: string; name: string; slug: string; imageUrl?: string };
  }>;
}> => {
  const res = await api.get('/stock-notifications/admin/insights');
  return res.data;
};

