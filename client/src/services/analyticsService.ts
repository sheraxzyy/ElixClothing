import api from './api';
import { AnalyticsData } from '../types';

export const getAnalytics = async (
  filter: string = '30days',
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData> => {
  const params: any = { filter };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const res = await api.get('/analytics', { params });
  return res.data;
};

export const exportOrdersCsv = async (
  filter: string = '30days',
  startDate?: string,
  endDate?: string
): Promise<void> => {
  const params = new URLSearchParams({ filter });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const res = await api.get(`/analytics/export-csv?${params.toString()}`, {
    responseType: 'blob',
  });

  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elix_financial_report_${filter}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

