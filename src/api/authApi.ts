// src/api/authApi.ts
import axios from './axiosInstance';

export const login = async (data: { email: string; password: string, clientId: string }) => {
  try {
    const response = await axios.post('/api/v1/auth/login', data);
    return response.data;
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Login API error:', error.response.data);
      throw {
        status: error.response.status,
        message: error.response.data.message || 'Login failed',
        data: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Login API error: No response received', error.request);
      throw {
        status: 0,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Login API error:', error.message);
      throw {
        status: 0,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};

export const register = async (data: { email: string; password: string; username: string; phone: string; role: string }) => {
  try {
    const response = await axios.post('/api/v1/auth/register', data);
    return response.data;
  } catch (error: any) {
    // Enhanced error handling similar to login
    if (error.response) {
      console.error('Register API error:', error.response.data);
      throw {
        status: error.response.status,
        message: error.response.data.message || 'Registration failed',
        data: error.response.data
      };
    } else if (error.request) {
      console.error('Register API error: No response received', error.request);
      throw {
        status: 0,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      console.error('Register API error:', error.message);
      throw {
        status: 0,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};
