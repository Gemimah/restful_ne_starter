import axios from 'axios';
import toast from 'react-hot-toast';
import { storage } from '../utils/storage.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed';

    if (error.response?.status === 401) {
      storage.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    if (!error.config?.skipErrorToast) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
