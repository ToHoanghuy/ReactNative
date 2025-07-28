// src/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';

const axiosInstance = axios.create({
  baseURL: 'https://jbaai.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    // Try to get the token from AsyncStorage
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // You could dispatch a logout action here or handle token refresh
      console.log('Authentication error - token might be expired');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
