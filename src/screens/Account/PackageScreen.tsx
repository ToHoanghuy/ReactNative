import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AccountStackParamList } from '../../types/navigation';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { PackageItem, setPackages, setLoading, setError, extractFeatures, getBackgroundColors } from '../../redux/slices/packagesSlice';
import { getPackages } from '../../api/packageApi';
import { RootState } from '../../redux/store';
import SplashScreen from '../../components/SplashScreen';
import { AppDispatch } from '../../redux/store';
const Icon = require('react-native-vector-icons/Feather').default;

type NavigationProp = StackNavigationProp<AccountStackParamList, 'Package'>;

const { width: screenWidth } = Dimensions.get('window');

const PackageScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'standard' | 'premium'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [tabChangeLoading, setTabChangeLoading] = useState(false);
  
  // Get all packages and loading status from Redux store
  const { items: allPackages, loading: packagesLoading, error: packagesError } = 
    useSelector((state: RootState) => state.packages);
  
  // Load packages on mount
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setIsLoading(true);
        dispatch(setLoading(true));
        dispatch(setError(null));
        
        // Gọi API trực tiếp
        const response = await getPackages();
        
        if (response.success) {
          // Biến đổi dữ liệu để thêm các trường cần thiết
          const transformedPackages: PackageItem[] = response.data
            .filter(pkg => pkg.status === true) // Chỉ lấy các gói có trạng thái active
            .map(pkg => ({
              ...pkg,
              backgroundColor: getBackgroundColors(pkg.type),
              features: extractFeatures(pkg.description)
            }));
          
          // Cập nhật Redux store
          dispatch(setPackages(transformedPackages));
        } else {
          dispatch(setError(response.message || 'Không thể lấy danh sách gói dịch vụ'));
        }
      } catch (error: any) {
        console.error('Error loading packages:', error);
        dispatch(setError(error.message || 'Đã xảy ra lỗi khi tải danh sách gói dịch vụ'));
      } finally {
        setIsLoading(false);
        dispatch(setLoading(false));
      }
    };
    
    loadPackages();
  }, [dispatch]);
  
  // Reset active index when tab changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab]);
  
  // Handle tab change with loading state
  const handleTabChange = (tab: 'standard' | 'premium') => {
    if (tab !== activeTab) {
      setTabChangeLoading(true);
      setActiveTab(tab);
      
      // Simulate loading delay
      setTimeout(() => {
        setTabChangeLoading(false);
      }, 800); // Show loading for 800ms
    }
  };

  // Filter packages based on selected tab
  const packages = useMemo(() => {
    return allPackages.filter((pkg: PackageItem) => pkg.type === activeTab);
  }, [allPackages, activeTab]);

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    } else {
      // Định dạng tiền Việt Nam (VND)
      return `${price.toLocaleString('vi-VN')}đ`;
    }
  };

  // Format duration in days
  const formatDuration = (days: number) => {
    if (days >= 360) {
      return t('1 năm');
    } else if (days >= 180) {
      return t('6 tháng');
    } else if (days >= 90) {
      return t('3 tháng');
    } else if (days >= 30) {
      return t('1 tháng');
    } else {
      return t('{{days}} ngày', { days });
    }
  };

  const renderItem = ({ item, index }: { item: PackageItem, index: number }) => {
    return (
      <LinearGradient
        colors={item.backgroundColor}
        style={styles.packageCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContentContainer}>
          <View style={styles.scrollableContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{item.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.packagePrice}>
                    {formatPrice(item.price, item.currency)}
                  </Text>
                  <Text style={styles.packageDuration}>
                    {formatDuration(item.duration)}
                  </Text>
                </View>
              </View>

              <Text style={styles.packageDescription}>
                {item.description.split('\n')[0]}
              </Text>

              <Text style={styles.featuresTitle}>
                {item.type === 'standard' 
                  ? t('Gói Standard Bao Gồm:') 
                  : t('Gói Premium Bao Gồm:')}
              </Text>
              
              {item.features && item.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Icon name="check-circle" size={16} color="#FFF" style={styles.featureIcon} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              <View style={styles.spacer} />
            </ScrollView>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.purchaseButton} activeOpacity={0.8}>
              <Text style={styles.purchaseButtonText}>{t('Thanh Toán')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  };

  // Show package counts
  const standardCount = allPackages.filter(pkg => pkg.type === 'standard').length;
  const premiumCount = allPackages.filter(pkg => pkg.type === 'premium').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* SplashScreen overlay for initial loading or tab change */}
      {(isLoading || tabChangeLoading || packagesLoading) && <SplashScreen isLoading={true} />}
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Gói Dịch Vụ')}</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'standard' && styles.activeTab]}
          activeOpacity={0.7}
          onPress={() => handleTabChange('standard')}
        >
          <Text style={[styles.tabText, activeTab === 'standard' && styles.activeTabText]}>
            {t('Tiêu chuẩn')} ({standardCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'premium' && styles.activeTab]}
          activeOpacity={0.7}
          onPress={() => handleTabChange('premium')}
        >
          <Text style={[styles.tabText, activeTab === 'premium' && styles.activeTabText]}>
            {t('Cao cấp')} ({premiumCount})
          </Text>
        </TouchableOpacity>
      </View>

      {packagesError ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#d9534f" />
          <Text style={styles.errorText}>{packagesError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={async () => {
              try {
                dispatch(setLoading(true));
                dispatch(setError(null));
                
                // Gọi API trực tiếp
                const response = await getPackages();
                
                if (response.success) {
                  // Biến đổi dữ liệu để thêm các trường cần thiết
                  const transformedPackages: PackageItem[] = response.data
                    .filter(pkg => pkg.status === true) // Chỉ lấy các gói có trạng thái active
                    .map(pkg => ({
                      ...pkg,
                      backgroundColor: getBackgroundColors(pkg.type),
                      features: extractFeatures(pkg.description)
                    }));
                  
                  // Cập nhật Redux store
                  dispatch(setPackages(transformedPackages));
                } else {
                  dispatch(setError(response.message || 'Không thể lấy danh sách gói dịch vụ'));
                }
              } catch (error: any) {
                console.error('Error loading packages:', error);
                dispatch(setError(error.message || 'Đã xảy ra lỗi khi tải danh sách gói dịch vụ'));
              } finally {
                dispatch(setLoading(false));
              }
            }}
          >
            <Text style={styles.retryButtonText}>{t('Thử lại')}</Text>
          </TouchableOpacity>
        </View>
      ) : packages.length === 0 && !isLoading && !packagesLoading ? (
        <View style={styles.emptyContainer}>
          <Icon name="package" size={48} color="#777" />
          <Text style={styles.emptyText}>
            {activeTab === 'standard' 
              ? t('Không có gói tiêu chuẩn nào') 
              : t('Không có gói cao cấp nào')}
          </Text>
        </View>
      ) : (
        <Carousel
          width={screenWidth * 0.9}
          height={screenWidth * 1.5}
          data={packages}
          renderItem={renderItem}
          onSnapToItem={(index) => setActiveIndex(index)}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          style={styles.carousel}
        />
      )}

      <View style={styles.paginationContainer}>
        {packages.map((_: PackageItem, index: number) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rightPlaceholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  carousel: {
    alignSelf: 'center',
  },
  packageCard: {
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
    height: '95%',
    margin: 10,
  },
  cardContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  scrollableContent: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  spacer: {
    height: 20,
  },
  packageHeader: {
    marginBottom: 15,
  },
  packageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  packageDuration: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  packageDescription: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    lineHeight: 22,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  purchaseButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2196F3',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default PackageScreen;
