import axios from "axios";

import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const refresh = useAuthStore.getState().refreshToken;
    if (!refresh) {
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
      useAuthStore.getState().setTokens(response.data.access, refresh);
      error.config.headers.Authorization = `Bearer ${response.data.access}`;
      return apiClient.request(error.config);
    } catch (refreshError) {
      useAuthStore.getState().clear();
      return Promise.reject(refreshError);
    }
  },
);
