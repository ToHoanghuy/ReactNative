// Implement the forgot password API functions
import axios from './axiosInstance';

// Request password reset by email
export const requestPasswordReset = async (email: string, otp: string) => {
  try {
    const response = await axios.post('/api/v1/auth/forgot-password', { email, otp: "123456" });
    return {
      success: true,
      message: response.data.message || 'Password reset email sent successfully',
      data: response.data
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Failed to send password reset email',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};

// Verify OTP for password reset
export const verifyOtpForPasswordReset = async (data: { email: string; otp: string }) => {
  try {
    const response = await axios.post('/api/v1/auth/verify-otp-to-reset-password', data);
    return {
      success: true,
      message: response.data.message || 'OTP verified successfully',
      data: response.data
    };
  } catch (error: any) {
    console.error('OTP verification error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Failed to verify OTP',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};

// Reset password with verified OTP
export const resetPassword = async (data: { 
  email: string; 
  otp: string; 
  newPassword: string 
}) => {
  try {
    const response = await axios.post('/api/v1/auth/reset-password', data);
    return {
      success: true,
      message: response.data.message || 'Password reset successful',
      data: response.data
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Failed to reset password',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};
