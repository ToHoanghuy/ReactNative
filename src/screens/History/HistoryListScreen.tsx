import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../../redux/store';
import { HistoryItem } from '../../redux/slices/historySlice';
import { HistoryStackParamList } from '../../types/navigation';
import SplashScreen from '../../components/SplashScreen';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;

type NavigationProp = StackNavigationProp<HistoryStackParamList, 'HistoryList'>;

// Helper function to determine color based on wellness score
const getScoreColor = (score: number, opacity: number = 1): string => {
  if (score >= 8) return `rgba(76, 175, 80, ${opacity})`; // Green
  if (score >= 6) return `rgba(255, 193, 7, ${opacity})`; // Yellow
  return `rgba(244, 67, 54, ${opacity})`; // Red
};

const HistoryListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { items, isLoading } = useAppSelector((state: RootState) => state.history);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  
  const ITEMS_PER_PAGE = 10;
  
  // Calculate displayed items based on current page
  const displayedItems = useMemo(() => {
    const endIndex = page * ITEMS_PER_PAGE;
    const currentItems = items.slice(0, endIndex);
    
    // Check if we've reached the end
    if (currentItems.length >= items.length) {
      setHasReachedEnd(true);
    } else {
      setHasReachedEnd(false);
    }
    
    return currentItems;
  }, [items, page]);

  // Load more items when reaching the end
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && !hasReachedEnd && displayedItems.length < items.length) {
      setLoadingMore(true);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        setPage(prevPage => prevPage + 1);
        setLoadingMore(false);
      }, 500);
    }
  }, [loadingMore, hasReachedEnd, displayedItems.length, items.length]);

  // Reset pagination when data changes
  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasReachedEnd(false);
    setLoadingMore(false);
  }, []);

  // Footer component for loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>{t('Loading more...')}</Text>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity 
      style={[styles.historyItem, { borderLeftColor: getScoreColor(item.wellnessScore || 8) }]}
      onPress={() => {
        console.log('Navigating to result detail with item:', item);
        navigation.navigate('ResultDetail', {
          scanResult: item
        });
      }}
    >
      <View style={styles.itemHeader}>
        <View style={styles.scoreContainer}>
          <Text style={styles.cardTitle}>{t('Wellness Score')}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.wellnessScore || 8, 0.15) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(item.wellnessScore || 8) }]}>{item.wellnessScore || 8}/10</Text>
          </View>
        </View>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.time}>{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
        </View>
      </View>

      <View style={styles.healthMetrics}>
        <View style={styles.metricRow}>
          <View style={[styles.metricIcon, { backgroundColor: '#e6f7ff' }]}>
            <MaterialCommunityIcons name="lungs" size={22} color="#0099cc" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>{t('Breathing Rate')}</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>{item.breathingRate || 14}</Text>
              <Text style={styles.metricUnit}>{item.breathingRateUnit || t('minutes')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.metricIcon, { backgroundColor: '#ffe6e6' }]}>
            <MaterialCommunityIcons name="heart-pulse" size={22} color="#ff5c5c" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>{t('Heart Rate')}</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>{item.heartRate || 52}</Text>
              <Text style={styles.metricUnit}>{item.heartRateUnit || 'bpm'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.metricIcon, { backgroundColor: '#fff2e6' }]}>
            <MaterialCommunityIcons name="brain" size={22} color="#ff9933" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>{t('Stress level')}</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>{item.stressLevel || 2}</Text>
              <Text style={styles.metricUnit}>{item.stressCategory || t('Moderate')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.metricIcon, { backgroundColor: '#e6ffe6' }]}>
            <MaterialCommunityIcons name="chart-line-variant" size={22} color="#33cc33" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>{t('Heart Rate Variability')}</Text>
            <View style={styles.metricValueContainer}>
              <Text style={styles.metricValue}>{item.heartRateVariability || 42}</Text>
              <Text style={styles.metricUnit}>{item.hrvUnit || t('Milliseconds')}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
        data={displayedItems}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={handleRefresh} 
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 16 }}>{t('No history items found')}</Text>
          </View>
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height
          offset: 200 * index,
          index,
        })}
      />
      
      {/* SplashScreen overlay */}
      <SplashScreen isLoading={loadingMore} />
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
    borderRadius: 15,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#4CAF50',
    borderColor: '#eee',
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  time: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  dateTimeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreContainer: {
    flexDirection: 'column',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  healthMetrics: {
    marginTop: 6,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  metricContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: '#888',
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
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default HistoryListScreen;
