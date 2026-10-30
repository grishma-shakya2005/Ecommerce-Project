import axios from 'axios';

export const adminApi = axios.create({ baseURL: '/api/admin' });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('palpali_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const clearAdminSession = () => localStorage.removeItem('palpali_admin_token');
