import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token if stored in session
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('shexzToken') || sessionStorage.getItem('shexzToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
