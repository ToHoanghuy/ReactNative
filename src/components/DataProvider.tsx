import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHistoryItems } from '../redux/slices/historySlice';
import { setUserProfile } from '../redux/slices/userSlice';

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
      },
      {
        id: '2',
        date: '2024-01-14T14:20:00Z',
        faceId: 'FACE_002',
        result: 'failed' as const,
        confidence: 0.45,
      },
      {
        id: '3',
        date: '2024-01-13T09:15:00Z',
        faceId: 'FACE_003',
        result: 'success' as const,
        confidence: 0.88,
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
  }, [dispatch]);

  return <>{children}</>;
};

export default DataProvider;
