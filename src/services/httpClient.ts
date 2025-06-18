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
  });  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth token to request:', config.url, 'Token exists:', !!token);
      } else {
        console.warn('No auth token found for request:', config.url);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fullError: error.response
      });

      const apiError: ApiError = {
        message: 'An error occurred',
        statusCode: error.response?.status || 500,
        errors: []
      };

      if (error.response?.data) {
        const errorData = error.response.data as any;
        apiError.message = errorData.message || errorData.error || errorData.Error || 'An error occurred';
        apiError.errors = errorData.errors || [];
        
        // Log the exact error data structure
        console.error('Error data structure:', errorData);
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
    // Also store with 'token' key for backward compatibility
    localStorage.setItem('token', token);
  },
  
  getToken: (): string | null => {
    // Try both keys to ensure compatibility
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
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
    localStorage.removeItem('token');
  }
};

export default apiClients;
