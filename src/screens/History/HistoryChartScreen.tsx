import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { HistoryItem } from '../../redux/slices/historySlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HistoryStackParamList } from '../../types/navigation';
import SplashScreen from '../../components/SplashScreen';
const MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;

const { width: screenWidth } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<HistoryStackParamList, 'HistoryChart'>;

const HistoryChartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { items } = useAppSelector((state: RootState) => state.history);
  const [selectedChart] = useState('line');
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '3months'>('7days');
  const [isLoading, setIsLoading] = useState(false);

  // Handle period change with loading
  const handlePeriodChange = (period: '7days' | '30days' | '3months') => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedPeriod(period);
      setIsLoading(false);
    }, 600);
  };

  // Process data for daily usage chart
  const dailyUsageData = useMemo(() => {
    const today = new Date();
    let days = [];
    let dayCount = 7;
    
    // Determine number of days based on selected period
    switch (selectedPeriod) {
      case '7days':
        dayCount = 7;
        break;
      case '30days':
        dayCount = 30;
        break;
      case '3months':
        dayCount = 90;
        break;
    }
    
    // Get last N days
    for (let i = dayCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }

    // Count scans per day
    const dailyCounts = days.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const count = items.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === dateString;
      }).length;
      return count;
    });

    // Create labels based on period
    let labels;
    if (selectedPeriod === '7days') {
      // Short day names for 7 days
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      labels = days.map(date => dayNames[date.getDay()]);
    } else if (selectedPeriod === '30days') {
      // Show every 5th day for 30 days
      labels = days.map((date, index) => {
        if (index % 5 === 0 || index === days.length - 1) {
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return '';
      });
    } else {
      // Show monthly for 3 months
      labels = days.map((date, index) => {
        if (index % 15 === 0 || index === days.length - 1) {
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return '';
      });
    }

    return {
      labels,
      datasets: [
        {
          data: dailyCounts,
          strokeWidth: 1,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        },
      ],
    };
  }, [items, selectedPeriod]);

  // Calculate statistics
  const totalScans = items.length;
  const successRate = items.length > 0 ? Math.round((items.filter(item => item.result === 'success').length / items.length) * 100) : 0;
  const todayScans = items.filter(item => {
    const today = new Date().toISOString().split('T')[0];
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    return itemDate === today;
  }).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Scan Statistics')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('Daily Usage')}</Text>
          
          {/* Period Selection Buttons */}
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === '7days' && styles.activePeriodButton]}
              onPress={() => handlePeriodChange('7days')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === '7days' && styles.activePeriodButtonText]}>
                {t('7 Days')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === '30days' && styles.activePeriodButton]}
              onPress={() => handlePeriodChange('30days')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === '30days' && styles.activePeriodButtonText]}>
                {t('30 Days')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === '3months' && styles.activePeriodButton]}
              onPress={() => handlePeriodChange('3months')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === '3months' && styles.activePeriodButtonText]}>
                {t('3 Months')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* SVG Line Chart */}
          <View style={styles.chartWrapper}>
            <Svg height="200" width={screenWidth - 32} style={styles.svgChart}>
              {/* Definitions for gradient */}
              <Defs>
                <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#007AFF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#5AC8FA" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#007AFF" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="#007AFF" stopOpacity="0.05" />
                </LinearGradient>
              </Defs>
              
              {/* Grid lines */}
              {[...Array(5)].map((_, index) => {
                const y = 30 + (index * 30);
                return (
                  <Line
                    key={`grid-${index}`}
                    x1="40"
                    y1={y}
                    x2={screenWidth - 72}
                    y2={y}
                    stroke="#F0F1F5"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Y-axis labels */}
              {[...Array(6)].map((_, index) => {
                const maxValue = Math.max(...dailyUsageData.datasets[0].data, 1);
                const value = Math.round((maxValue * (5 - index)) / 5);
                const y = 30 + (index * 30);
                return (
                  <SvgText
                    key={`y-label-${index}`}
                    x="35"
                    y={y + 4}
                    fontSize="11"
                    fill="#8E8E93"
                    textAnchor="end"
                    fontWeight="500"
                  >
                    {value}
                  </SvgText>
                );
              })}
              
              {/* Area under the line */}
              {dailyUsageData.datasets[0].data.length > 1 && (
                <Path
                  d={(() => {
                    const maxValue = Math.max(...dailyUsageData.datasets[0].data, 1);
                    const chartWidth = screenWidth - 112; // Increased chart width
                    const chartHeight = 120;
                    const stepX = chartWidth / (dailyUsageData.datasets[0].data.length - 1);
                    
                    let path = `M 40 ${180}`; // Start from bottom left
                    
                    // Draw to first point
                    const firstY = 180 - (dailyUsageData.datasets[0].data[0] / maxValue) * chartHeight;
                    path += ` L 40 ${firstY}`;
                    
                    // Draw curve through all points
                    dailyUsageData.datasets[0].data.forEach((value, index) => {
                      const x = 40 + (index * stepX);
                      const y = 180 - (value / maxValue) * chartHeight;
                      path += ` L ${x} ${y}`;
                    });
                    
                    // Close the path at bottom right
                    const lastX = 40 + ((dailyUsageData.datasets[0].data.length - 1) * stepX);
                    path += ` L ${lastX} 180 Z`;
                    
                    return path;
                  })()}
                  fill="url(#areaGradient)"
                />
              )}
              
              {/* Main line */}
              {dailyUsageData.datasets[0].data.length > 1 && (
                <Polyline
                  points={dailyUsageData.datasets[0].data
                    .map((value, index) => {
                      const maxValue = Math.max(...dailyUsageData.datasets[0].data, 1);
                      const chartWidth = screenWidth - 112; // Increased chart width
                      const chartHeight = 120;
                      const x = 40 + (index * (chartWidth / (dailyUsageData.datasets[0].data.length - 1)));
                      const y = 180 - (value / maxValue) * chartHeight;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Data points */}
              {dailyUsageData.datasets[0].data.map((value, index) => {
                const maxValue = Math.max(...dailyUsageData.datasets[0].data, 1);
                const chartWidth = screenWidth - 112; // Increased chart width
                const chartHeight = 120;
                const x = 40 + (index * (chartWidth / (dailyUsageData.datasets[0].data.length - 1)));
                const y = 180 - (value / maxValue) * chartHeight;
                
                return (
                  <Circle
                    key={`point-${index}`}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#007AFF"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Value labels */}
              {dailyUsageData.datasets[0].data.map((value, index) => {
                if (value === 0) return null;
                
                const maxValue = Math.max(...dailyUsageData.datasets[0].data, 1);
                const chartWidth = screenWidth - 112; // Increased chart width
                const chartHeight = 120;
                const x = 40 + (index * (chartWidth / (dailyUsageData.datasets[0].data.length - 1)));
                const y = 180 - (value / maxValue) * chartHeight;
                
                return (
                  <SvgText
                    key={`value-${index}`}
                    x={x}
                    y={y - 15}
                    fontSize="11"
                    fill="#1D1D1F"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {value}
                  </SvgText>
                );
              })}
              
              {/* X-axis labels */}
              {dailyUsageData.labels.map((label, index) => {
                const chartWidth = screenWidth - 112; // Increased chart width
                const x = 40 + (index * (chartWidth / (dailyUsageData.labels.length - 1)));
                
                return (
                  <SvgText
                    key={`x-label-${index}`}
                    x={x}
                    y="195"
                    fontSize="11"
                    fill="#8E8E93"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {label}
                  </SvgText>
                );
              })}
            </Svg>
          </View>
        </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('Success Rate')}</Text>
        {/* <BarChart
          data={barData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix="%"
          showBarTops={false}
        /> */}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('Result Distribution')}</Text>
        {/* <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'15'}
          style={styles.chart}
        /> */}
      </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalScans}</Text>
            <Text style={styles.statLabel}>{t('Total Scans')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{successRate}%</Text>
            <Text style={styles.statLabel}>{t('Success Rate')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{todayScans}</Text>
            <Text style={styles.statLabel}>{t('Today')}</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* SplashScreen overlay */}
      <SplashScreen isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  activePeriodButton: {
    backgroundColor: '#007AFF',
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  activePeriodButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  chartWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 0, // Remove horizontal padding
    alignItems: 'center',
    marginHorizontal: 0, // Remove horizontal margin
  },
  svgChart: {
    backgroundColor: 'transparent',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
    fontWeight: '500',
  },
});

export default HistoryChartScreen;
