import api from './api';

export const getProducts = async (params: Record<string, any> = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductBySlug = async (slugOrId: string) => {
  const response = await api.get(`/products/${slugOrId}`);
  return response.data;
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
