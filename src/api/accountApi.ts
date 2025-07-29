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
