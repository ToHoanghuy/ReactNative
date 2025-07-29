// src/api/accountApi.ts
import axios from './axiosInstance';

// Interface for profile update data
export interface ProfileUpdateData {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  smokingStatus?: number;
}

// Interface for profile API response
export interface ProfileApiResponse {
  message: string;
  data: {
    _id: string;
    userId: string;
    height: number;
    weight: number;
    age: number;
    gender: string;
    smokingStatus: number;
    __v: number;
  };
}

// Interface for notification switch API response
export interface NotificationSwitchResponse {
  message: string;
  isSubscription: {
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
  success?: boolean;
}

export const updateProfile = async (profileData: ProfileUpdateData): Promise<ProfileApiResponse> => {
  try {
    const response = await axios.post<ProfileApiResponse>('/api/v1/profile/update', profileData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Update Profile API error:', error.response.data);
      throw {
        status: error.response.status,
        message: error.response.data.message || 'Profile update failed',
        data: error.response.data
      };
    } else if (error.request) {
      console.error('Update Profile API error: No response received', error.request);
      throw {
        status: 0,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      console.error('Update Profile API error:', error.message);
      throw {
        status: 0,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};

export const switchNotification = async (enabled: boolean): Promise<NotificationSwitchResponse> => {
  try {
    const response = await axios.post<NotificationSwitchResponse>('/api/v1/user/switch-notification', {
      emailNotificationsEnabled: enabled
    });
    
    // Thêm trường success để tương thích với logic hiện tại
    if (response.data.message === "User information updated successfully") {
      response.data.success = true;
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Switch Notification API error:', error.response.data);
      throw {
        status: error.response.status,
        message: error.response.data.message || 'Notification switch failed',
        data: error.response.data
      };
    } else if (error.request) {
      console.error('Switch Notification API error: No response received', error.request);
      throw {
        status: 0,
        message: 'No response from server. Check your internet connection.',
        data: null
      };
    } else {
      console.error('Switch Notification API error:', error.message);
      throw {
        status: 0,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  }
};
