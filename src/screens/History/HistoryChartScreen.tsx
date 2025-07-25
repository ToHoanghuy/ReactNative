import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
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

  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '3months'>('7days');
  const [isLoading, setIsLoading] = useState(false);

  const handlePeriodChange = (period: '7days' | '30days' | '3months') => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedPeriod(period);
      setIsLoading(false);
    }, 600);
  };

  // Tính toán dữ liệu cho biểu đồ
  const dailyUsageData = useMemo(() => {
    const today = new Date();
    let dayCount = 7;
    switch (selectedPeriod) {
      case '30days':
        dayCount = 30;
        break;
      case '3months':
        dayCount = 90;
        break;
      default:
        dayCount = 7;
    }

    const days: Date[] = [];
    for (let i = dayCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }

    // Đếm số scan mỗi ngày
    const data = days.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const count = items.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === dateString;
      }).length;
      return { value: count };
    });

    // Tạo label
    const labels = days.map((date, index) => {
      if (selectedPeriod === '7days') {
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return { label: dayNames[date.getDay()] };
      }
      if (selectedPeriod === '30days') {
        return index % 5 === 0 || index === days.length - 1
          ? { label: `${date.getDate()}/${date.getMonth() + 1}` }
          : { label: '' };
      }
      return index % 15 === 0 || index === days.length - 1
        ? { label: `${date.getDate()}/${date.getMonth() + 1}` }
        : { label: '' };
    });

    // Kết hợp label và data
    return data.map((item, index) => ({
      value: item.value,
      label: labels[index].label,
    }));
  }, [items, selectedPeriod]);

  // Tính thống kê
  const totalScans = items.length;
  const successRate = items.length > 0
    ? Math.round((items.filter(item => item.result === 'success').length / items.length) * 100)
    : 0;
  const todayScans = items.filter(item => {
    const today = new Date().toISOString().split('T')[0];
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    return itemDate === today;
  }).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Scan Statistics')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Line Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('Daily Usage')}</Text>

          <View style={styles.periodSelector}>
            {['7days', '30days', '3months'].map(period => (
              <TouchableOpacity
                key={period}
                style={[styles.periodButton, selectedPeriod === period && styles.activePeriodButton]}
                onPress={() => handlePeriodChange(period as any)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.activePeriodButtonText,
                  ]}
                >
                  {period === '7days' ? t('7 Days') : period === '30days' ? t('30 Days') : t('3 Months')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <LineChart
            data={dailyUsageData}
            width={screenWidth - 32}
            height={200}
            thickness={2}
            color="#007AFF"
            hideRules
            initialSpacing={10}
            spacing={Math.max(4, (screenWidth - 60) / dailyUsageData.length)}
            areaChart
            startFillColor="rgba(0,122,255,0.3)"
            endFillColor="rgba(0,122,255,0.05)"
            startOpacity={0.9}
            endOpacity={0.2}
            yAxisTextStyle={{ color: '#8E8E93' }}
            xAxisLabelTextStyle={{ color: '#8E8E93', fontSize: 10 }}
            noOfSections={4}
            maxValue={Math.max(...dailyUsageData.map(item => item.value), 1)}
            showVerticalLines
            verticalLinesColor="#F0F1F5"
          />
        </View>

        {/* Stats */}
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

      {/* Loading overlay */}
      <SplashScreen isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  backButton: { padding: 8 },
  placeholder: { width: 40, height: 40 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', flex: 1 },
  scrollContainer: { flex: 1 },
  chartContainer: {
    backgroundColor: '#fff',
    // margin: 16,
    borderRadius: 16,
    // padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  chartTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  periodSelector: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#F2F2F7', borderRadius: 12, padding: 3 },
  periodButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activePeriodButton: { backgroundColor: '#007AFF', borderRadius: 9 },
  periodButtonText: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  activePeriodButtonText: { color: '#fff', fontWeight: '700' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#007AFF' },
  statLabel: { fontSize: 13, color: '#8E8E93', marginTop: 6, fontWeight: '500' },
});

export default HistoryChartScreen;
