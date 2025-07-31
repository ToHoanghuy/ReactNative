import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHistoryItems } from '../redux/slices/historySlice';
import { setUserProfile } from '../redux/slices/userSlice';
import { setAccounts } from '../redux/slices/accountsSlice';
import { setPackages } from '../redux/slices/packagesSlice';
import { getHistoryData } from '../utils/storage';
import { refreshTokenIfNeeded } from '../utils/tokenUtils';

// Sample data provider component
const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if token is expired and needs refreshing
        console.log('Checking if token needs refreshing in DataProvider');
        await refreshTokenIfNeeded();
      } catch (error) {
        console.error('Error refreshing token in DataProvider:', error);
      }
      
      // Load existing history data first
      const existingHistoryData = await getHistoryData();
      
      if (existingHistoryData && existingHistoryData.length > 0) {
        // Use existing data if available
        dispatch(setHistoryItems(existingHistoryData));
      } else {
        // Initialize sample data only if no existing data


        dispatch(setHistoryItems([]));
      }

      // Initialize sample user profile
      const sampleUserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        language: 'vn' as const,
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
          _id: 'pkg1',
          userId: 'user1',
          name: 'Basic Care 30',
          price: '$7.66',
          discount: 0,
          currency: 'USD',
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
          type: 'standard' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          location: 'Vietnam',
        },
        {
          id: '2',
          _id: 'pkg2',
          userId: 'user1',
          name: 'Premium Care 90',
          price: '$19.99',
          discount: 0,
          currency: 'USD',
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
          type: 'premium' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          location: 'Vietnam',
        },
        {
          id: '3',
          _id: 'pkg3',
          userId: 'user1',
          name: 'Complete Care 365',
          price: '$59.99',
          discount: 0,
          currency: 'USD',
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
          type: 'premium' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          location: 'Vietnam',
        },
        {
          id: '4',
          _id: 'pkg4',
          userId: 'user1',
          name: 'Family Plan',
          price: '$29.99',
          discount: 0,
          currency: 'USD',
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
          type: 'standard' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          location: 'Vietnam',
        }
      ];
      

      dispatch(setPackages([]));
    };

    initializeData();
  }, [dispatch]);

  return <>{children}</>;
};

export default DataProvider;
