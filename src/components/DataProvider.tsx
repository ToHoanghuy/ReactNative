import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHistoryItems } from '../redux/slices/historySlice';
import { setUserProfile } from '../redux/slices/userSlice';
import { setAccounts } from '../redux/slices/accountsSlice';
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
    };

    initializeData();
  }, [dispatch]);

  return <>{children}</>;
};

export default DataProvider;
