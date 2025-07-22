import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../../redux/store';
import { HistoryItem } from '../../redux/slices/historySlice';
import { HistoryStackParamList } from '../../types/navigation';

type NavigationProp = StackNavigationProp<HistoryStackParamList, 'HistoryList'>;

const HistoryListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { items, isLoading } = useAppSelector((state: RootState) => state.history);

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.result === 'success' ? '#4CAF50' : '#F44336' },
          ]}>
          <Text style={styles.statusText}>{t(item.result)}</Text>
        </View>
      </View>
      <Text style={styles.faceId}>{t('Face ID')}: {item.faceId}</Text>
      <Text style={styles.confidence}>{t('Confidence')}: {(item.confidence * 100).toFixed(1)}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('HistoryCalendar')}>
          <Text style={styles.buttonText}>{t('Calendar Filter')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chartButton}
          onPress={() => navigation.navigate('HistoryChart')}>
          <Text style={styles.buttonText}>{t('Chart Report')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => {}} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  chartButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  faceId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
    color: '#666',
  },
});

export default HistoryListScreen;
