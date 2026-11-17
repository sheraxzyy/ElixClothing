import api from './api';
import mockProducts from '../data/mockData';

export const getProducts = async (params: Record<string, any> = {}) => {
  try {
    const response = await api.get('/products', { params });
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    return mockProducts;
  } catch (err) {
    console.warn('API unavailable, serving local ELIX product catalog:', err);
    return mockProducts;
  }
};

export const getProductBySlug = async (slugOrId: string) => {
  try {
    const response = await api.get(`/products/${slugOrId}`);
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    console.warn(`API lookup failed for ${slugOrId}, searching local catalog:`, err);
  }

  // Fallback to mock catalog
  const found = mockProducts.find(
    (p) =>
      p.slug === slugOrId ||
      p.id === slugOrId ||
      p.slug.toLowerCase() === slugOrId.toLowerCase() ||
      p.id.toLowerCase() === slugOrId.toLowerCase()
  );

  return found || null;
};

export const createProduct = async (productData: any) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: any) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const formatPrice = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return 'LKR 3,000';
  return `LKR ${Number(value).toLocaleString()}`;
};
