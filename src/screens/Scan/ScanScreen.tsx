import React, { useState,} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { ScanStackParamList } from '../../types/navigation';
const Icon = require('react-native-vector-icons/Feather').default;
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming, 
  withRepeat,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import Modal from '../../components/Modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearHistory } from '../../redux/slices/historySlice';

type NavigationProp = StackNavigationProp<ScanStackParamList, 'ScanMain'>;

const ScanScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const [isScanning, setIsScanning] = useState(false);
  const [hasHealthData, setHasHealthData] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'not-determined' | 'restricted'>('not-determined');
  const [showCamera, setShowCamera] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showScanningTips, setShowScanningTips] = useState(false);
  const [hasScanningTipsBeenShown, setHasScanningTipsBeenShown] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const cameraRef = useRef<Camera>(null);
  // Tham chiếu đến timer để có thể hủy khi cần
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get available camera devices
  const devices = useCameraDevices();
  const frontDevice = devices.find(device => device.position === 'front');
  const backDevice = devices.find(device => device.position === 'back');
  const activeDevice = isFrontCamera ? frontDevice : backDevice;
  
  // Animation values for heart icon and effects - khởi tạo bên ngoài render cycle
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const outlineScale = useSharedValue(1);
  const outlineOpacity = useSharedValue(0.7);
  
  // Animated style for flash effect
  const animatedFlashStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value,
    };
  });

  // Animation for face outline pulsing effect
  
  // Start face outline animation when scanning
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    
    if (isScanning) {
      // Create pulsing effect for the face outline
      const startOutlinePulse = () => {
        // Tạo animation cho outline
        outlineScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Infinite repeat
          false // No reverse
        );
        
        outlineOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(0.7, { duration: 1000 })
          ),
          -1, // Infinite repeat
          false // No reverse
        );
      };
      
      // Sử dụng setTimeout để đảm bảo animation không chạy trong render phase
      timeout = setTimeout(startOutlinePulse, 500);
    } else {
      // Khi không còn quét, đặt lại giá trị một cách an toàn
      setTimeout(() => {
        outlineScale.value = withTiming(1);
        outlineOpacity.value = withTiming(0.7);
      }, 0);
    }
    
    // Cleanup khi component unmount hoặc isScanning thay đổi
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isScanning]);
  
  // Animated style for the face outline
  const animatedOutlineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: outlineScale.value }],
      opacity: outlineOpacity.value,
      borderColor: isScanning ? '#2196F3' : 'rgba(255,255,255,0.5)',
    };
  });
  
  // Khởi tạo giá trị shared values bên ngoài useEffect để tránh thiết lập trong quá trình render
  useEffect(() => {
    // Clear history state on component mount to start fresh
    // dispatch(clearHistory());
    
    // Check for camera permissions
    checkCameraPermission();
    
    // Tạo animation riêng biệt
    const startPulseAnimation = () => {
      scale.value = withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      );
    };
    
    // Load scanning tips shown status from AsyncStorage
    const loadScanningTipsShownStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('scanningTipsShown');
        if (value !== null) {
          setHasScanningTipsBeenShown(true);
        }
      } catch (error) {
        console.error('Error loading scanning tips status:', error);
      }
    };
    
    loadScanningTipsShownStatus();
    
    // Bắt đầu animation sau khi component đã render
    const timeout = setTimeout(startPulseAnimation, 100);
    const interval = setInterval(startPulseAnimation, 2000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      
      // Đảm bảo xóa timer scan khi component unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [scale, dispatch]);
  
  // Check camera permission
  const checkCameraPermission = async () => {
    const permission = await Camera.getCameraPermissionStatus();
    setCameraPermission(permission);
  };
  
  // Request camera permission
  const requestCameraPermission = async () => {
    const permission = await Camera.requestCameraPermission();
    setCameraPermission(permission);
    
    if (permission === 'granted') {
      setShowCamera(true);
      startFaceScan();
    } else {
      Alert.alert(
        t('Camera Permission'),
        t('Please allow camera access to scan your face'),
        [{ text: t('OK') }]
      );
    }
  };

  // Animation for heart icon when clicked - using runOnUI để tránh thay đổi giá trị trong quá trình render
  const animateHeartIcon = () => {
    // Không sử dụng 'worklet' ở đây để tránh chạy trong JS thread
    setTimeout(() => {
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
    }, 0);
  };
  
  // Start face scanning with 60-second timer
  const startFaceScan = () => {
    // Đánh dấu trạng thái đang quét
    setIsScanning(true);
    setTimeRemaining(6);
    
    // Xóa timer cũ nếu có
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Take snapshots at intervals to simulate face scanning
    const snapshotIntervals = [15, 30, 45]; // Snapshot at these seconds
    
    // Lưu tham chiếu đến timer để có thể hủy khi cần
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        
        // If it's time to take a snapshot
        if (snapshotIntervals.includes(newTime) && cameraRef.current) {
          takeSnapshot();
        }
        
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          completeScan();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  // Take a camera snapshot to simulate face scanning
  const takeSnapshot = async () => {
    if (cameraRef.current) {
      try {
        // Flash effect before taking snapshot - an toàn hơn với setTimeout
        setTimeout(() => {
          flashOpacity.value = withSequence(
            withTiming(0.8, { duration: 100 }),
            withTiming(0, { duration: 500 })
          );
        }, 0);
        
        // Take the photo silently (no shutter sound)
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
          enableShutterSound: false // Silent capture for scanning
        });
        
        // In a real app, you would process the photo here for face detection
        console.log('Snapshot taken:', photo.path);
        
        // Could send to backend API for processing in a real app
      } catch (error) {
        console.error('Failed to take snapshot:', error);
      }
    }
  };
  
  // Complete the scanning process
  // Hủy quá trình quét khuôn mặt
  const cancelScan = () => {
    console.log('Cancel button pressed, isScanning:', isScanning);
    
    // Hiển thị Modal xác nhận thay vì Alert
    setShowCancelModal(true);
  };
  
  const handleCancel = () => {
    // Hủy timer nếu có
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Đặt lại trạng thái
    setIsScanning(false);
    setShowCamera(false);
    setTimeRemaining(0);
    setShowCancelModal(false);
  };
  
  // Toggle camera between front and back
  const toggleCamera = () => {
    setIsFrontCamera(prev => !prev);
  };

  // Complete the scanning process
  const completeScan = async () => {
    try {
      // Clear the timer if it exists
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Take a final photo if camera is available
      if (cameraRef.current) {
        const finalPhoto = await cameraRef.current.takePhoto({
          flash: 'off',
          enableShutterSound: false
        });
        console.log('Final photo taken:', finalPhoto.path);
      }
      
      // Close camera
      setShowCamera(false);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate unique ID using timestamp + random string
      const generateUniqueId = () => {
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substr(2, 9);
        return `${timestamp}_${randomPart}`;
      };
      
      // Simulate face scanning result with more detailed health data
      const mockResult = {
        id: generateUniqueId(),
        date: new Date().toISOString(),
        faceId: `FACE_${Math.random().toString(36).substr(2, 9)}`,
        result: Math.random() > 0.3 ? 'success' : 'failed' as 'success' | 'failed',
        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        wellnessScore: Math.floor(Math.random() * 3) + 7, // 7-10
        heartRate: Math.floor(Math.random() * 30) + 60, // 60-90
        breathingRate: Math.floor(Math.random() * 6) + 12, // 12-18
        bloodPressure: `${Math.floor(Math.random() * 20) + 110}/${Math.floor(Math.random() * 15) + 70}`,
        oxygenSaturation: Math.floor(Math.random() * 5) + 95, // 95-100
      };

      setIsScanning(false);
      
      // Điều hướng đến ResultDetailScreen thay vì hiển thị Alert
      navigation.navigate('ResultDetail', {
        scanResult: mockResult
      });
      
    } catch (error) {
      console.error('Error completing scan:', error);
      setIsScanning(false);
      setShowCamera(false);
      Alert.alert(t('Error'), t('An error occurred during scanning. Please try again.'));
    }
  };
  
  const handleScan = async () => {
    // Animate heart icon - sử dụng setTimeout để tránh chạy animation trong render phase
    setTimeout(() => {
      animateHeartIcon();
    }, 0);
    
    if (cameraPermission !== 'granted') {
      requestCameraPermission();
    } else {
      // Show scanning tips before starting (only once in app lifecycle)
      if (!hasScanningTipsBeenShown) {
        setShowScanningTips(true);
        setHasScanningTipsBeenShown(true);
        // Save to AsyncStorage that scanning tips have been shown
        try {
          await AsyncStorage.setItem('scanningTipsShown', 'true');
        } catch (error) {
          console.error('Error saving scanning tips status:', error);
        }
      } else {
        setShowCamera(true);
        startFaceScan();
      }
    }
  };

  // Define animated styles for heart icon
  const animatedIconStyle = useAnimatedStyle(() => {
    // Chỉ đọc giá trị trong useAnimatedStyle, không thiết lập giá trị
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
                  <Icon name="activity" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Blood Pressure')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="heart" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Heart Rate')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="activity" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Heart Rate Variability')}</Text>
                </View>
              </View>

              <View style={styles.indicatorRow}>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="wind" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Oxygen Saturation')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="activity" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Sympathetic Stress')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.redIndicator]}>
                  <Icon name="sun" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Parasympathetic Activity')}</Text>
                </View>
              </View>

              <View style={styles.indicatorRow}>
                <View style={[styles.healthIndicator, styles.blueIndicator]}>
                  <Icon name="droplet" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('High Total Cholesterol Risk')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.blueIndicator]}>
                  <Icon name="trending-up" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('High Blood Pressure Risk')}</Text>
                </View>
                <View style={[styles.healthIndicator, styles.blueIndicator]}>
                  <Icon name="droplet" size={18} color="white" />
                  <Text style={styles.indicatorText}>{t('Low Hemoglobin Risk')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.faceScanContainer}>
            <View style={styles.phoneWithFaceScan}>
              <Icon name="user" size={40} color="#333" />
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
                <Icon name="activity" size={24} color="white" />
              </Animated.View>
            </View>
            <Text style={styles.scanButtonText}>{t('Scan Now')}</Text>
          </TouchableOpacity>
      </View>
      
      {/* Camera Section (Full Screen Overlay when active) */}
      {showCamera && activeDevice != null && (
        <View style={styles.fullScreenCameraContainer}>
          {/* Camera đặt ở dưới cùng với pointerEvents="none" */}
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={activeDevice}
            isActive={true}
            photo={true}
            pointerEvents="none" // Đảm bảo camera không chặn các sự kiện touch
          />
          
          {/* Flash effect overlay */}
          <Animated.View style={[styles.flashOverlay, animatedFlashStyle]} />
          
          {/* UI Overlay for Camera */}
          <View style={styles.cameraUIOverlay}>
            {/* Xóa nút back ở trên cùng */}
            
            {/* Top Section - Health Grid (chỉ hiển thị khi không trong chế độ quét - isScanning=false) */}
            {!isScanning && (
              <View style={styles.cameraTopSection}>
                <View style={styles.cameraHealthGrid}>
                  <View style={styles.gridRow}>
                    <View style={[styles.gridItem, styles.redGridItem]}>
                      <Icon name="activity" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Huyết áp')}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.redGridItem]}>
                      <Icon name="heart" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Nhịp tim')}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.redGridItem]}>
                      <Icon name="activity" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Biến thiên nhịp tim')}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.gridRow}>
                    <View style={[styles.gridItem, styles.redGridItem]}>
                      <Icon name="wind" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Nồng độ Oxy')}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.redGridItem]}>
                      <Icon name="activity" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Chỉ số thần kinh giao cảm')}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.redGridItem]}>
                      <Icon name="sun" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Hoạt động phó giao cảm')}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.gridRow}>
                    <View style={[styles.gridItem, styles.blueGridItem]}>
                      <Icon name="droplet" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Nguy cơ cholesterol cao')}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.blueGridItem]}>
                      <Icon name="trending-up" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Nguy cơ huyết áp cao')}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.blueGridItem]}>
                      <Icon name="droplet" size={18} color="white" />
                      <Text style={styles.gridItemText}>{t('Nguy cơ thiếu máu')}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.facePlaceholder}>
                  <View style={styles.facePlaceholderInner}>
                    <Icon name="user" size={40} color="#333" />
                  </View>
                </View>
              </View>
            )}
            
            {/* Blue Status Bar with Countdown */}
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>
                {t('Đang phân tích khuôn mặt...')} {timeRemaining}s
              </Text>
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(timeRemaining / 60) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            
            {/* Camera View Area with Face Outline */}
            <View style={styles.faceOutlineContainer}>
              <Animated.View style={[styles.faceOutline, animatedOutlineStyle]} />
              
              {/* Toggle Camera Button - Top Right */}
              <TouchableOpacity 
                style={styles.toggleCameraButton}
                onPress={toggleCamera}
                activeOpacity={0.7}
              >
                <Icon name="refresh-cw" size={20} color="white" />
              </TouchableOpacity>
              
              {/* Camera button khi không quét, nút hủy khi đang quét */}
              <View style={styles.cameraIconContainer}>
                {!isScanning ? (
                  <TouchableOpacity 
                    style={styles.cameraButton}
                    onPress={startFaceScan}
                    activeOpacity={0.7}
                  >
                    <Icon name="camera" size={30} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.cameraButton, styles.cancelButton]}
                    onPress={cancelScan}
                    activeOpacity={0.7}
                  >
                    <Icon name="x" size={30} color="white" />
                    <Text style={styles.cancelButtonText}>{t('Hủy')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Modal xác nhận hủy quét */}
            <Modal
              visible={showCancelModal}
              title={t('Quay lại')}
              message={t('Bạn có chắc chắn muốn quay lại? Quá trình quét sẽ bị hủy.')}
              onClose={() => setShowCancelModal(false)}
              type="info"
              buttons={[
                {
                  text: t('Ở lại'),
                  onPress: () => setShowCancelModal(false),
                  type: 'default'
                },
                {
                  text: t('Quay lại'),
                  onPress: handleCancel,
                  type: 'danger'
                }
              ]}
            />
            
            {/* Bottom Message Area - chỉ hiển thị khi không trong chế độ quét */}
            {!isScanning && (
              <View style={styles.messageArea}>
                <View style={styles.messageContentContainer}>
                  <Text style={styles.messageText}>
                    {t('Bạn chưa có dữ liệu sức khỏe quét nào. Vui lòng quét để có dữ liệu sức khỏe.')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
      
      {(isScanning && (!showCamera || !activeDevice)) && (
        <View style={styles.scanningOverlay}>
          <View style={styles.scanningAnimation}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.scanningText}>{t('Preparing camera...')}</Text>
          </View>
        </View>
      )}
      
      {/* Bottom Section - Message (only shown when not scanning) */}
      {!showCamera && (
        <View style={styles.oveylayMessage}>
          <View style={styles.messageContainer}>
            <Text style={styles.noDataMessage}>
              {hasHealthData 
                ? t('Your health data is now available.') 
                : t('You have no health scan data yet. Please scan to get health data.')}
            </Text>
          </View>
        </View>
      )}
      
      {/* Scanning Tips Modal - Only shown once during app lifecycle */}
      <Modal
        visible={showScanningTips}
        title={t('Scanning Tips')}
        message={t('For best results:\n• Ensure good lighting\n• Remove glasses\n• Look directly at the camera\n• Keep your face within the outline')}
        onClose={() => setShowScanningTips(false)}
        type="info"
        buttons={[
          {
            text: t('Start Scan'),
            onPress: () => {
              setShowScanningTips(false);
              setShowCamera(true);
              startFaceScan();
            },
            type: 'primary'
          }
        ]}
      />
      
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
    backgroundColor: '#2196F3',
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
  
  // Camera full screen styles
  fullScreenCameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  camera: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  // Flash effect overlay
  flashOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    opacity: 0,
    zIndex: 2,
  },
  cameraUIOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    flex: 1,
    zIndex: 50, // Tăng zIndex để đảm bảo UI nằm trên Camera
  },
  
  // Camera top section with health grid
  cameraTopSection: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#89a',
    borderRadius: 10,
    margin: 10,
  },
  cameraHealthGrid: {
    flex: 1,
    marginRight: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  gridItem: {
    borderRadius: 6,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
    height: 40,
  },
  redGridItem: {
    backgroundColor: '#FF4D4F',
  },
  blueGridItem: {
    backgroundColor: '#1890FF',
  },
  gridItemText: {
    color: 'white',
    fontSize: 7,
    textAlign: 'center',
    marginTop: 2,
  },
  facePlaceholder: {
    width: '25%',
    alignItems: 'center',
  },
  facePlaceholderInner: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#89a',
    borderRadius: 10,
    aspectRatio: 1/2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  
  // Status bar styles
  statusBar: {
    backgroundColor: '#2196F3',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative', // Để có thể định vị nút back
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Back button in header
  backButton: {
    position: 'absolute',
    left: 10,
    top: 8,
    zIndex: 1000, // Tăng zIndex để đảm bảo nút này luôn ở trên cùng
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Thêm background để dễ nhìn thấy và nhấn
    borderRadius: 22, // Bo tròn
  },
  
  // Nút Back ở góc trên cùng
  topBackButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    padding: 10,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Face outline styles
  faceOutlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative', // Thêm position relative để đảm bảo các phần tử con absolute được định vị đúng
  },
  faceOutline: {
    width: 220,
    height: 280,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 150,
    backgroundColor: 'transparent',
    // Thêm hiệu ứng shadow cho face outline khi scanning
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 999, // Tăng zIndex cao hơn để đảm bảo nút nằm trên các phần tử khác
    pointerEvents: 'auto', // Đảm bảo nút có thể nhận sự kiện chạm
  },
  cameraButton: {
    width: 70, // Tăng kích thước nút
    height: 70, // Tăng kích thước nút
    borderRadius: 35,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 1000, // Tăng zIndex
    elevation: 8, // Tăng elevation trên Android
    shadowColor: '#000', // Thêm shadow cho iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Toggle camera button style
  toggleCameraButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'white',
  },
  // Nút hủy quét
  cancelButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)', // Màu đỏ cho nút hủy
    flexDirection: 'column',
    zIndex: 1000, // Đảm bảo nút nằm trên cùng
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12, // Tăng kích thước chữ
    fontWeight: 'bold', // Thêm đậm cho chữ
    marginTop: 2,
  },
  
  // Message area at bottom
  messageArea: {
    backgroundColor: 'white',
    padding: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    width: '100%',
  },
  messageContentContainer: {
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  messageText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Progress bar
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
  
  // Scanning overlay for loading state
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  scanningAnimation: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  // Original message section
  oveylayMessage: {
    backgroundColor: '#2196F3',
    width: '100%',
    height: '100%'
  },
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
