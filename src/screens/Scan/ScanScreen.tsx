import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming, 
  Easing
} from 'react-native-reanimated';
// import { RNCamera } from 'react-native-camera';
// import { useDispatch } from 'react-redux';
// import { addHistoryItem } from '../../redux/slices/historySlice';

// const { width: _width, height: _height } = Dimensions.get('window');

const ScanScreen: React.FC = () => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [hasHealthData, setHasHealthData] = useState(false);
  // const cameraRef = useRef<RNCamera>(null);
  // const dispatch = useDispatch();
  
  // Animation values for heart icon
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Subtle continuous animation when the component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      // Gentle pulse effect
      scale.value = withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      );
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Animation for heart icon when clicked
  const animateHeartIcon = () => {
    // Create pulse effect
    scale.value = withSequence(
      withTiming(1.4, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
    
    // Create rotation effect
    rotation.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    
    // Create opacity effect
    opacity.value = withSequence(
      withTiming(0.7, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
  };
  
  const handleScan = async () => {
    // Animate heart icon
    animateHeartIcon();
    
    setIsScanning(true);
    // Simulate face scanning process
    setTimeout(() => {
      const mockResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        faceId: `FACE_${Math.random().toString(36).substr(2, 9)}`,
        result: Math.random() > 0.3 ? 'success' : 'failed',
        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      };

      setIsScanning(false);
      if (mockResult.result === 'success') {
        setHasHealthData(true);
        Alert.alert(t('Success'), `${t('Face recognized with')} ${(mockResult.confidence * 100).toFixed(1)}% ${t('confidence')}`);
      } else {
        Alert.alert(t('Failed'), t('Face recognition failed. Please try again.'));
      }

      // dispatch(addHistoryItem(mockResult));
    }, 3000);
  };

  // Define animated styles for heart icon
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
      opacity: opacity.value
    };
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="white" />
      
      {/* Top Section - Health Indicators */}
      <View style={styles.topSection}>
        <View style={styles.phoneGridContainer}>
          <View style={styles.phoneFrame}>
            <View style={styles.healthGrid}>
              <View style={styles.indicatorRow}>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="heart-pulse" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Blood Pressure')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="heart" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Heart Rate')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="heart-pulse" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Heart Rate Variability')}</Text>
                </View>
              </View>

              <View style={styles.indicatorRow}>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="lungs" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Oxygen Saturation')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="brain" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Sympathetic Stress')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="meditation" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Parasympathetic Activity')}</Text>
                </View>
              </View>

              <View style={styles.indicatorRow}>
                <View style={[styles.healthIndicator, styles.blueIndicator]}>
                  <Icon name="test-tube" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('High Total Cholesterol Risk')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.blueIndicator]}>
                  <Icon name="chart-line-variant" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('High Blood Pressure Risk')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.blueIndicator]}>
                  <Icon name="water" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Low Hemoglobin Risk')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.faceScanContainer}>
            <View style={styles.phoneWithFaceScan}>
              <Icon name="face-recognition" size={40} color="#333" />
            </View>
          </View>
        </View>
        
      </View>
      
      {/* Main Camera/Scan Section */}
      <View style={styles.scanButtonStrip}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScan}
            disabled={isScanning}>
            <View style={styles.scanButtonIcon}>
              <Animated.View style={animatedIconStyle}>
                <Icon name="heart-pulse" size={24} color="white" />
              </Animated.View>
            </View>
            <Text style={styles.scanButtonText}>{t('Scan Now')}</Text>
          </TouchableOpacity>
      
        {isScanning && (
          <View style={styles.scanningOverlay}>
            <View style={styles.scanningAnimation}>
              <Text style={styles.scanningText}>{t('Analyzing face...')}</Text>
            </View>
          </View>
        )}
        
      </View>
      
      {/* Bottom Section - Message */}
      <View style={styles.oveylayMessage}>
        <View style={styles.messageContainer}>
          <Text style={styles.noDataMessage}>
            {hasHealthData 
              ? t('Your health data is now available.') 
              : t('You have no health scan data yet. Please scan to get health data.')}
          </Text>
        </View>
      </View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  // Top section styles
  topSection: {
    height: '33%',
    backgroundColor: '#f0f8ff',
    position: 'relative',
  },
  phoneGridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  phoneFrame: {
    width: '65%',
    borderWidth: 2,
    borderColor: '#894',
    borderRadius: 20,
    padding: 10,
    backgroundColor: 'white',
  },
  healthGrid: {
    flex: 1,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  healthIndicator: {
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    height: 50,
  },
  redIndicator: {
    backgroundColor: '#FF4D4F',
  },
  blueIndicator: {
    backgroundColor: '#1890FF',
  },
  indicatorText: {
    color: 'white',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
  },
  faceScanContainer: {
    width: '30%',
    alignItems: 'flex-end',
  },
  phoneWithFaceScan: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#894',
    borderRadius: 20,
    aspectRatio: 1/2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  // Scan button section
  scanButtonStrip: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#006D5B',
    width: '100%',
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonIcon: {
    width: 38,
    height: 38,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningAnimation: {
    backgroundColor: 'rgba(0, 109, 91, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  oveylayMessage: {
    backgroundColor: '#006D5B',
    width: '100%',
    height: '100%'
  },
  // Message section
  messageContainer: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    backgroundColor: 'white',
    height: '100%',
  },
  noDataMessage: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ScanScreen;
