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

export const refreshAccessToken = async (data: { refreshToken: string; clientId: string }) => {
  try {
    console.log('Calling refresh token API with data:', data);
    const response = await axios.post('/api/v1/auth/refresh-token', data);
    console.log('Refresh token API response:');
    
    // Create a properly formatted response object
    let formattedResponse = {
      success: false,
      data: {} as any,
      message: ''
    };
    
    // Check if the response has the expected structure
    if (response.data) {
      // Handle the format we're actually getting: {success: true, token: {accessToken, refreshToken}}
      if (response.data.success && response.data.token && response.data.token.accessToken) {
        formattedResponse = {
          success: true,
          data: {
            accessToken: response.data.token.accessToken,
            refreshToken: response.data.token.refreshToken
          },
          message: 'Token refreshed successfully'
        };
      } 
      // Also handle original expected formats as fallbacks
      else if (response.data.accessToken) {
        // API directly returned accessToken (not wrapped in data property)
        formattedResponse = {
          success: true,
          data: response.data,
          message: 'Token refreshed successfully'
        };
      } else if (response.data.data && response.data.data.accessToken) {
        // API returned accessToken wrapped in data property
        formattedResponse = {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Token refreshed successfully'
        };
      } else if (response.data.success && response.data.data) {
        // API already returned in our expected format
        formattedResponse = response.data;
      } else {
        // Unexpected format, but some data exists
        console.warn('Unexpected refresh token response format:', response.data);
        formattedResponse.message = 'Invalid response format from server';
      }
    }
    
    console.log('Formatted refresh token response:', formattedResponse);
    return formattedResponse;
  } catch (error: any) {
    // Enhanced error handling
    console.error('Refresh Token API error:', error);
    
    if (error.response) {
      console.error('Response error details:', error.response.data);
      // Check if this is an expired refresh token error
      if (error.response.data && 
          (error.response.data.message === 'Invalid or expired refresh token' ||
           error.response.data.message === 'Invalid refresh token')) {
        return {
          success: false,
          message: 'Invalid or expired refresh token',
          data: error.response.data
        };
      }
      return {
        success: false,
        message: error.response.data.message || 'Token refresh failed',
        data: error.response.data
      };
    } else if (error.request) {
      console.error('No response received:', error.request);
      return {
        success: false,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      console.error('Error message:', error.message);
      return {
        success: false,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};

export const register = async (data: { 
  email: string; 
  password: string; 
  username: string; 
  phone: string; 
  role: string;
  optionEmail?: string;
  invitationCode?: string;
  address?: string;
}) => {
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
