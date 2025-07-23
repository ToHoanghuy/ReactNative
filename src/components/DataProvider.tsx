import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHistoryItems } from '../redux/slices/historySlice';
import { setUserProfile } from '../redux/slices/userSlice';
import { setAccounts } from '../redux/slices/accountsSlice';

// Sample data provider component
const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize sample data
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

    const sampleUserProfile = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      language: 'en' as const,
    };

    dispatch(setHistoryItems(sampleHistoryItems));
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
  }, [dispatch]);

  return <>{children}</>;
};

export default DataProvider;
