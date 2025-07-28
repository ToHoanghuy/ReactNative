import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HistoryStackParamList } from '../../types/navigation';
import ResultDetailScreen from '../Scan/ResultDetailScreen';

type ResultDetailWrapperRouteProp = RouteProp<HistoryStackParamList, 'ResultDetail'>;

const ResultDetailWrapper: React.FC = () => {
  const route = useRoute<ResultDetailWrapperRouteProp>();
  
  // Log for debugging purposes
  console.log('ResultDetailWrapper received params:', route.params);
  
  return (
    <ResultDetailScreen 
      route={{
        params: route.params
      } as any} 
    />
  );
};

export default ResultDetailWrapper;
