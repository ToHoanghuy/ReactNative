// src/api/packageApi.ts
import axios from './axiosInstance';

// Interface cho một gói dịch vụ
export interface Package {
  _id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  discount: number;
  currency: string;
  status: boolean;
  type: 'standard' | 'premium';
  location: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Interface cho phản hồi API danh sách gói
export interface PackagesApiResponse {
  success: boolean;
  message: string;
  data: Package[];
  filters: Record<string, any>;
}

/**
 * Lấy danh sách các gói dịch vụ từ API
 * @returns Danh sách các gói dịch vụ
 */
export const getPackages = async (): Promise<PackagesApiResponse> => {
  try {
    const response = await axios.post<PackagesApiResponse>('/api/v1/package');
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Get Packages API error:', error.response.data);
      throw {
        status: error.response.status,
        message: error.response.data.message || 'Không thể lấy danh sách gói dịch vụ',
        data: error.response.data
      };
    } else if (error.request) {
      console.error('Get Packages API error: No response received', error.request);
      throw {
        status: 0,
        message: 'Không nhận được phản hồi từ máy chủ. Kiểm tra kết nối mạng của bạn.',
        data: null
      };
    } else {
      console.error('Get Packages API error:', error.message);
      throw {
        status: 0,
        message: error.message || 'Đã xảy ra lỗi không xác định',
        data: null
      };
    }
  }
};

/**
 * @param type ('standard' hoặc 'premium')
 * @returns Danh sách các gói dịch vụ theo loại
 */
export const getPackagesByType = async (type: 'standard' | 'premium'): Promise<Package[]> => {
  try {
    const response = await getPackages();
    if (response.success) {
      return response.data.filter(pkg => pkg.type === type && pkg.status === true);
    }
    return [];
  } catch (error) {
    console.error('Error filtering packages by type:', error);
    return [];
  }
};
