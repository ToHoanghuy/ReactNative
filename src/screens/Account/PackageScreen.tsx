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
import { useSelector } from 'react-redux';
import { PackageItem } from '../../redux/slices/packagesSlice';
import { RootState } from '../../redux/store';
import SplashScreen from '../../components/SplashScreen';
const Icon = require('react-native-vector-icons/Feather').default;

type NavigationProp = StackNavigationProp<AccountStackParamList, 'Package'>;

const { width: screenWidth } = Dimensions.get('window');

const PackageScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'standard' | 'premium'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Reset active index when tab changes
    setActiveIndex(0);
  }, [activeTab]);

  // Get all packages from Redux store
  const allPackages = useSelector((state: RootState) => state.packages.items);
  
  // Handle tab change with loading state
  const handleTabChange = (tab: 'standard' | 'premium') => {
    if (tab !== activeTab) {
      setIsLoading(true);
      setActiveTab(tab);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 800); // Show loading for 800ms
    }
  };

  // Filter packages based on selected tab
  const packages = useMemo(() => {
    return allPackages.filter((pkg: PackageItem) => pkg.type === activeTab);
  }, [allPackages, activeTab]);

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
                  <Text style={styles.packagePrice}>{item.price}</Text>
                  <Text style={styles.packageDuration}>{item.duration}</Text>
                </View>
              </View>

              <Text style={styles.packageDescription}>{item.description}</Text>

              <Text style={styles.featuresTitle}>{t('Gói Standard Bao Gồm:')}</Text>
              
              {item.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Text style={styles.bulletPoint}>•</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* SplashScreen overlay */}
      <SplashScreen isLoading={isLoading} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Gói')}</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'standard' && styles.activeTab]}
          activeOpacity={0.7}
          onPress={() => handleTabChange('standard')}
        >
          <Text style={activeTab === 'standard' ? styles.activeTabText : styles.tabText}>{t('Tiêu chuẩn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'premium' && styles.activeTab]}
          activeOpacity={0.7}
          onPress={() => handleTabChange('premium')}
        >
          <Text style={activeTab === 'premium' ? styles.activeTabText : styles.tabText}>{t('Cao cấp')}</Text>
        </TouchableOpacity>
      </View>

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

      <View style={styles.paginationContainer}>
        {packages.length > 0 && packages.map((_: PackageItem, index: number) => (
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
    borderBottomColor: '#eee',
    backgroundColor: 'white',
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
    marginVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#e6e6e6',
    borderRadius: 30,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 16,
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  carousel: {
    alignSelf: 'center',
    marginTop: 10,
  },
  packageCard: {
    borderRadius: 20,
    padding: 0, // Remove padding here as we'll add it to the scrollable content
    margin: 10,
    height: '95%',
    overflow: 'hidden',
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
    height: 20, // Extra space at the bottom of scrollable content
  },
  packageHeader: {
    marginBottom: 15,
  },
  packageName: {
    fontSize: 28,
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
    marginLeft: 4,
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
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 18,
    color: 'white',
    marginRight: 8,
    marginTop: -5,
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
});

export default PackageScreen;
