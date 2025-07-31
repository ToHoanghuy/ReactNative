import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { StackNavigationProp } from '@react-navigation/stack';
import { HistoryStackParamList } from '../../types/navigation';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { HistoryItem, ScanItem, addScanToDate } from '../../redux/slices/historySlice';
import SplashScreen from '../../components/SplashScreen';
import { getHealthDataByDate, getHealthDataByRange } from '../../api/healthDataApi';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
const MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;

type NavigationProp = StackNavigationProp<HistoryStackParamList, 'HistoryCalendar'>;
type RouteProps = RouteProp<HistoryStackParamList, 'HistoryCalendar'>;

const HistoryCalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state: RootState) => state.history);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const initialDate = route.params?.initialDate || today;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<string>(initialDate.substring(0, 7)); // YYYY-MM format
  
  // Filter items for selected date
  
  const selectedDateItem = items.find(item => item._id === selectedDate);
  const count = selectedDateItem?.count || 0;
  // If count is 0, return empty array regardless of data that might exist
  const filteredScans = (selectedDateItem && count > 0) ? selectedDateItem.data : [];
  
  // Fetch data for initial date when component mounts
  useEffect(() => {
    // No need to fetch data on mount - we'll use what's already in the Redux store
    // This prevents the issue of overwriting data for dates other than today
  }, []);

  // Create marked dates object with scan data
  const markedDates = items.reduce((acc, item) => {
    const itemDate = item._id; // Already in YYYY-MM-DD format
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

  // Function to fetch health data for the selected date
  const fetchHealthDataForDate = async (dateString: string) => {
    try {
      setIsLoading(true);
      
      // Format date for API: DD-MM-YYYY
      const apiDate = formatDateForApi(dateString);
      console.log('Fetching health data for date:', apiDate);
      
      // Save the original selected date before API call
      const originalSelectedDate = dateString; // YYYY-MM-DD format
      
      const response = await getHealthDataByDate(apiDate);
      
      if (response.success && response.data) {
        console.log('Health data fetched successfully:', response.data);
        
        // Check if response.data is a single object or has a data array
        let dataToProcess = response.data;
        
        // Handle case where API returns { data: [...] } format
        if (response.data.data && Array.isArray(response.data.data)) {
          dataToProcess = response.data.data;
        }
        
        // Process the data based on structure
        if (Array.isArray(dataToProcess)) {
          // Convert all scan items
          if (dataToProcess.length > 0) {
            // Convert each scan to ScanItem format - use the original selected date
            const scanItems: ScanItem[] = dataToProcess.map(scan => 
              convertApiDataToScanItem(scan, originalSelectedDate)
            );
            
            // Add all scans to the date - use the original selected date as dateId
            dispatch(addScanToDate({
              dateId: originalSelectedDate,
              scans: scanItems
            }));
          }
        } else {
          // Assume it's a single health data object
          const newScanItem: ScanItem = convertApiDataToScanItem(dataToProcess, originalSelectedDate);
          
          // Add single scan to the date - use the original selected date as dateId
          dispatch(addScanToDate({
            dateId: originalSelectedDate,
            scans: [newScanItem]
          }));
        }
      } else {
        console.log('No health data available for selected date:', response.message);
        
        // Even if there's no data, add an empty entry for this date to ensure it's tracked in the Redux store
        // This prevents data from other dates from appearing when this date is selected
        dispatch(addScanToDate({
          dateId: dateString,
          scans: []
        }));
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      Alert.alert(
        t('Error'),
        t('Failed to fetch health data. Please try again later.')
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // We've removed the fetchHealthDataForMonth function since we're only fetching data on date selection now
  
  // Handle month change in calendar
  const onMonthChange = (month: any) => {
    const newMonth = month.dateString.substring(0, 7); // YYYY-MM format
    if (newMonth !== currentMonth) {
      setCurrentMonth(newMonth);
      // No longer fetching data for the entire month
      console.log('Month changed to:', newMonth);
    }
  };
  
  // Format date from YYYY-MM-DD to DD-MM-YYYY for API
  const formatDateForApi = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };
  
  // Convert API response to ScanItem format
  const convertApiDataToScanItem = (apiData: any, dateString: string): ScanItem => {
    // Safety check for null or undefined apiData
    if (!apiData) {
      console.warn('Received null or undefined apiData');
      return {
        id: `health-data-${dateString}-${Date.now()}`,
        createdAt: new Date(dateString).toISOString(),
        faceId: `face-${dateString.replace(/-/g, '')}`,
        result: 'success',
        confidence: 0.9,
        wellnessScore: 0,
        heartRate: 0,
        heartRateUnit: 'bpm',
        breathingRate: 0,
        breathingRateUnit: t('breaths/min'),
        stressLevel: 0,
        stressCategory: t('Normal'),
        heartRateVariability: 0,
        hrvUnit: 'ms',
        oxygenSaturation: 0,
        oxygenSaturationUnit: '%',
      };
    }
    
    // Generate a consistent ID based on date and any unique identifier in the data
    const id = apiData._id || apiData.id || `health-data-${dateString}-${Date.now()}`;
    
    // Extract values from API response with default values of 0
    // Check if the wellnessIndex is in the direct object or nested in healthData
    const wellnessScore = apiData.wellnessIndex?.value || 
                         apiData.healthData?.wellnessIndex?.value || 0;
    
    const heartRate = apiData.pulseRate?.value || 
                     apiData.healthData?.pulseRate?.value || 0;
    
    const breathingRate = apiData.respirationRate?.value || 
                         apiData.healthData?.respirationRate?.value || 0;
    
    const stressLevel = apiData.stressLevel?.value || 
                       apiData.healthData?.stressLevel?.value || 0;
    
    const heartRateVariability = apiData.sdnn?.value || 
                                apiData.healthData?.sdnn?.value || 0;
    
    const oxygenSaturation = apiData.oxygenSaturation?.value || 
                            apiData.healthData?.oxygenSaturation?.value || 0;
    
    // Map stress level value to category
    const stressCategory = mapStressLevelToCategory(stressLevel);
    
    // Use the provided createdAt timestamp or the date string - make sure we always use the original date
    const createdAt = apiData.createdAt || new Date(dateString).toISOString();
    
    return {
      id,
      createdAt,
      faceId: `face-${dateString.replace(/-/g, '')}`, // Use consistent faceId based on date
      result: 'success', // Default value since this is required
      confidence: 0.9, // Default value since this is required
      wellnessScore,
      heartRate,
      heartRateUnit: 'bpm',
      breathingRate,
      breathingRateUnit: t('breaths/min'),
      stressLevel,
      stressCategory,
      heartRateVariability,
      hrvUnit: 'ms',
      oxygenSaturation,
      oxygenSaturationUnit: '%',
    };
  };
  
  // Map stress level value to category
  const mapStressLevelToCategory = (level: number): string => {
    switch (level) {
      case 1: return t('Low');
      case 2: return t('Normal');
      case 3: return t('Moderate');
      case 4: return t('High');
      case 5: return t('Very High');
      default: return t('Normal');
    }
  };

  const onDayPress = (day: any) => {
    setIsLoading(true);
    setSelectedDate(day.dateString);
    
    // No need to clear or fetch data - just use what's in Redux
    // This prevents overwriting data between dates
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };
  //   fetchHealthDataForDate(day.dateString);
  // };

  // Helper function to determine color based on wellness score
  const getScoreColor = (score: number, opacity: number = 1): string => {
    if (score >= 8) return `rgba(76, 175, 80, ${opacity})`; // Green
    if (score >= 6) return `rgba(255, 193, 7, ${opacity})`; // Yellow
    return `rgba(244, 67, 54, ${opacity})`; // Red
  };

  const renderScanItem = ({ item }: { item: ScanItem }) => (
    <TouchableOpacity
    onPress={() => {
        console.log('Navigating to result detail with item:', item);
        navigation.navigate('ResultDetail', {
          scanResult: item
        });
      }}
     style={[styles.historyItem, { borderLeftColor: getScoreColor(item.wellnessScore || 8) }]}>
      <View style={styles.itemHeader}>
        <View style={styles.scoreContainer}>
          <Text style={styles.cardTitle}>{t('Wellness Score')}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.wellnessScore || 8, 0.15) }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(item.wellnessScore || 8) }]}>{item.wellnessScore || 8}/10</Text>
          </View>
        </View>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
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
    </TouchableOpacity>
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
        onMonthChange={onMonthChange}
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
          {selectedDateItem && selectedDateItem.count > 0 && ` (${selectedDateItem.count} ${t('scans')})`}
        </Text>
        
        {filteredScans.length > 0 ? (
          <FlatList
            data={filteredScans}
            renderItem={renderScanItem}
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
