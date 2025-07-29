// src/api/userApi.ts
import axios from './axiosInstance';

// Interface for change language API response
export interface ChangeLanguageApiResponse {
  message: string;
  isChangeLanguage: {
    typeLogin: {
      type: string;
    };
    deletedAt: null;
    _id: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    verify: boolean;
    language: string;
    discount: boolean;
    isSubscription: boolean;
    emailNotificationsEnabled: boolean;
    isPayment: boolean;
    isHideScore: boolean;
    type: string;
    optionEmail: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    isDeleted: boolean;
    isHideGLB1: boolean;
  };
  // Thêm trường success để tương thích với logic hiện tại
  success?: boolean;
}

/**
 * Change the user's language preference
 * @param language Language code ('en' or 'vi')
 * @returns API response with success status and updated language data
 */
export const changeLanguage = async (language: 'en' | 'vn'): Promise<ChangeLanguageApiResponse> => {
  try {
    const response = await axios.post<ChangeLanguageApiResponse>('/api/v1/user/change-language', { language });
    
    // Add success field for compatibility with existing code
    if (response.data.message === "User information updated successfully") {
      response.data.success = true;
    }
    
    return response.data;
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code outside 2xx range
      console.error('Change Language API error:', error.response.data);
      throw {
        status: error.response.status,
        message: error.response.data.message || 'Thay đổi ngôn ngữ thất bại',
        data: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Change Language API error: No response received', error.request);
      throw {
        status: 0,
        message: 'Không nhận được phản hồi từ máy chủ. Kiểm tra kết nối mạng của bạn.',
        data: null
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Change Language API error:', error.message);
      throw {
        status: 0,
        message: error.message || 'Đã xảy ra lỗi không xác định',
        data: null
      };
    }
  }
};
