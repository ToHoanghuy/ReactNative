import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HistoryStackParamList } from '../../types/navigation';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { HistoryItem } from '../../redux/slices/historySlice';
import SplashScreen from '../../components/SplashScreen';
const MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;

type NavigationProp = StackNavigationProp<HistoryStackParamList, 'HistoryCalendar'>;

const HistoryCalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { items } = useAppSelector((state: RootState) => state.history);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  
  // Filter items for selected date
  const filteredItems = items.filter(item => {
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    return itemDate === selectedDate;
  });

  // Create marked dates object with scan data
  const markedDates = items.reduce((acc, item) => {
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    if (!acc[itemDate]) {
      acc[itemDate] = {
        marked: true,
        dotColor: '#2196F3',
        selectedColor: itemDate === selectedDate ? '#2196F3' : undefined,
        selected: itemDate === selectedDate,
      };
    }
    return acc;
  }, {} as any);

  // Ensure selected date is marked even if no data
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#2196F3',
    };
  }

  const onDayPress = (day: any) => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setSelectedDate(day.dateString);
      setIsLoading(false);
    }, 800);
  };

  // Helper function to determine color based on wellness score
  const getScoreColor = (score: number, opacity: number = 1): string => {
    if (score >= 8) return `rgba(76, 175, 80, ${opacity})`; // Green
    if (score >= 6) return `rgba(255, 193, 7, ${opacity})`; // Yellow
    return `rgba(244, 67, 54, ${opacity})`; // Red
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={[styles.historyItem, { borderLeftColor: getScoreColor(item.wellnessScore || 8) }]}>
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
            <Text style={styles.metricLabel}>{t('Stress Level')}</Text>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('Scan History Calendar')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#2196F3',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2196F3',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: '#2196F3',
          monthTextColor: '#2196F3',
        }}
      />

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          {t('Scans for')} {new Date(selectedDate).toLocaleDateString()}
        </Text>
        
        {filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            // showsVerticalScrollIndicator={true}
            style={styles.flatListStyle}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t('No scans found for this date')}</Text>
          </View>
        )}
      </View>
      
      {/* SplashScreen overlay */}
      <SplashScreen isLoading={isLoading} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 8,
    // borderRadius: 8,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  historySection: {
    marginTop: 20,
    paddingHorizontal: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  flatListStyle: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  noDataContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  scoreContainer: {
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
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
  dateTimeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
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
});

export default HistoryCalendarScreen;
