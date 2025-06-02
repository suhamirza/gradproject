import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';
import type { ApiResponse, ApiError } from '../types/api';

// Create base axios instance
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: 'An error occurred',
        statusCode: error.response?.status || 500,
        errors: []
      };

      if (error.response?.data) {
        const errorData = error.response.data as any;
        apiError.message = errorData.message || errorData.error || 'An error occurred';
        apiError.errors = errorData.errors || [];
      } else if (error.message) {
        apiError.message = error.message;
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Create service clients for each microservice
export const apiClients = {
  userService: createApiClient(API_CONFIG.SERVICES.USER_SERVICE),
  taskService: createApiClient(API_CONFIG.SERVICES.TASK_SERVICE),
  chatService: createApiClient(API_CONFIG.SERVICES.CHAT_SERVICE),
  notificationService: createApiClient(API_CONFIG.SERVICES.NOTIFICATION_SERVICE),
};

// Generic API call wrapper
export const apiCall = async <T>(
  client: AxiosInstance,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await client.request<ApiResponse<T>>({
      method,
      url: endpoint,
      data,
    });
    
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

// Token management utilities
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken');
  },
  
  setRefreshToken: (refreshToken: string) => {
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },
  
  removeRefreshToken: () => {
    localStorage.removeItem('refreshToken');
  },
  
  clearAll: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};

export default apiClients;
