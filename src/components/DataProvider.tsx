import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHistoryItems } from '../redux/slices/historySlice';
import { setUserProfile } from '../redux/slices/userSlice';
import { setAccounts } from '../redux/slices/accountsSlice';
import { setPackages } from '../redux/slices/packagesSlice';
import { getHistoryData } from '../utils/storage';

// Sample data provider component
const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeData = async () => {
      // Load existing history data first
      const existingHistoryData = await getHistoryData();
      
      if (existingHistoryData && existingHistoryData.length > 0) {
        // Use existing data if available
        dispatch(setHistoryItems(existingHistoryData));
      } else {
        // Initialize sample data only if no existing data
        const sampleHistoryItems = [
          {
            id: '1',
            date: '2024-01-15T10:30:00Z',
            faceId: 'FACE_001',
            result: 'success' as const,
            confidence: 0.95,
            wellnessScore: 9,
            breathingRate: 15,
            breathingRateUnit: 'bpm',
            heartRate: 58,
            heartRateUnit: 'bpm',
            stressLevel: 1,
            stressCategory: 'Low',
            heartRateVariability: 49,
            hrvUnit: 'ms',
          },
          {
            id: '2',
            date: '2024-01-14T14:20:00Z',
            faceId: 'FACE_002',
            result: 'failed' as const,
            confidence: 0.45,
            wellnessScore: 7,
            breathingRate: 18,
            breathingRateUnit: 'bpm',
            heartRate: 72,
            heartRateUnit: 'bpm',
            stressLevel: 3,
            stressCategory: 'Moderate',
            heartRateVariability: 31,
            hrvUnit: 'ms',
          },
          {
            id: '3',
            date: '2024-01-13T09:15:00Z',
            faceId: 'FACE_003',
            result: 'success' as const,
            confidence: 0.88,
            wellnessScore: 8,
            breathingRate: 14,
            breathingRateUnit: 'bpm',
            heartRate: 62,
            heartRateUnit: 'bpm',
            stressLevel: 2,
            stressCategory: 'Low',
            heartRateVariability: 42,
            hrvUnit: 'ms',
          },
        ];

        dispatch(setHistoryItems(sampleHistoryItems));
      }

      // Initialize sample user profile
      const sampleUserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        language: 'vi' as const,
      };

      dispatch(setUserProfile(sampleUserProfile));

      // Initialize sample accounts
      const sampleAccounts = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
        },
        {
          id: '2',
          name: 'Test User',
          email: 'tohoanghuy19052004@gmail.com',
          password: 'test123',
        },
        {
          id: '3',
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'john123',
        },
      ];

      dispatch(setAccounts(sampleAccounts));

      // Initialize sample packages
      const samplePackages = [
        {
          id: '1',
          name: 'Basic Care 30',
          price: '$7.66',
          duration: '/30 ngày',
          description: 'Gói Standard: Nắm Bắt Sức Khỏe Cơ Bản Trong Tầm Tay',
          features: [
            'Huyết áp: Theo dõi áp lực máu, một chỉ số quan trọng để đánh giá sức khỏe tim mạch.',
            'Nhịp tim: Giúp bạn nắm bắt tần số hoạt động của trái tim.',
            'Nhịp thở: Đánh giá tần suất hô hấp, phản ánh sức khỏe hệ hô hấp.',
            'HRV (Biến thiên nhịp tim): Một chỉ số quan trọng cho thấy khả năng phục hồi và cân bằng của hệ thần kinh tự chủ.',
            'Mức độ căng thẳng: Giúp bạn nhận diện và quản lý stress hàng ngày.',
            'SpO2 (Độ bão hòa oxy trong máu): Đo lượng lượng oxy trong máu, chỉ số quan trọng về sức khỏe hô hấp.',
          ],
          backgroundColor: ['#3498db', '#2ecc71'] as [string, string],
          type: 'standard' as const
        },
        {
          id: '2',
          name: 'Premium Care 90',
          price: '$19.99',
          duration: '/90 ngày',
          description: 'Gói Premium: Phân Tích Chuyên Sâu Cho Sức Khỏe Toàn Diện',
          features: [
            'Tất cả tính năng của gói Basic',
            'Phân tích xu hướng sức khỏe dài hạn',
            'Báo cáo sức khỏe hàng tuần',
            'Phát hiện sớm các dấu hiệu bất thường',
            'Tư vấn sức khỏe từ chuyên gia',
            'Đánh giá nguy cơ bệnh tim mạch',
          ],
          backgroundColor: ['#9b59b6', '#3498db'] as [string, string],
          type: 'premium' as const
        },
        {
          id: '3',
          name: 'Complete Care 365',
          price: '$59.99',
          duration: '/365 ngày',
          description: 'Gói Complete: Chăm Sóc Toàn Diện Suốt Cả Năm',
          features: [
            'Tất cả tính năng của gói Premium',
            'Phân tích AI về nguy cơ sức khỏe',
            'Đánh giá sức khỏe tâm lý',
            'Theo dõi chất lượng giấc ngủ',
            'Đề xuất lối sống khỏe mạnh',
            'Hỗ trợ y tế khẩn cấp 24/7',
          ],
          backgroundColor: ['#e74c3c', '#f39c12'] as [string, string],
          type: 'premium' as const
        },
        {
          id: '4',
          name: 'Family Plan',
          price: '$29.99',
          duration: '/30 ngày',
          description: 'Gói Gia Đình: Chăm Sóc Sức Khỏe Cho Cả Gia Đình',
          features: [
            'Theo dõi sức khỏe cho tối đa 5 thành viên',
            'Báo cáo so sánh sức khỏe các thành viên',
            'Chia sẻ dữ liệu sức khỏe giữa các thành viên',
            'Tư vấn dinh dưỡng gia đình',
            'Đề xuất hoạt động thể chất phù hợp',
            'Theo dõi lịch tiêm chủng gia đình',
          ],
          backgroundColor: ['#16a085', '#27ae60'] as [string, string],
          type: 'standard' as const
        }
      ];
      

      dispatch(setPackages(samplePackages));
    };

    initializeData();
  }, [dispatch]);

  return <>{children}</>;
};

export default DataProvider;
