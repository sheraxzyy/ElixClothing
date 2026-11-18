import api from './api';
import { DropType } from '../types';

export const getPublicDrops = async (): Promise<{
  serverTime: string;
  active: DropType[];
  upcoming: DropType[];
  previous: DropType[];
}> => {
  try {
    const res = await api.get('/drops');
    return res.data;
  } catch (err) {
    console.warn('Failed to fetch drops from API, using fallback:', err);
    return {
      serverTime: new Date().toISOString(),
      active: [],
      upcoming: [],
      previous: [],
    };
  }
};

export const getDropBySlugOrId = async (slugOrId: string): Promise<DropType> => {
  const res = await api.get(`/drops/${slugOrId}`);
  return res.data;
};

export const getAllDropsAdmin = async (): Promise<DropType[]> => {
  const res = await api.get('/drops/admin/all');
  return res.data;
};

export const createDrop = async (data: Partial<DropType> & { productIds?: any[] }): Promise<DropType> => {
  const res = await api.post('/drops', data);
  return res.data;
};

export const updateDrop = async (id: string, data: Partial<DropType> & { productIds?: any[] }): Promise<DropType> => {
  const res = await api.put(`/drops/${id}`, data);
  return res.data;
};

export const deleteDrop = async (id: string): Promise<void> => {
  await api.delete(`/drops/${id}`);
};

