import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  withRepeat,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const Icon = require('react-native-vector-icons/Feather').default;
import { BottomTabParamList, HistoryStackParamList, AccountStackParamList, ScanStackParamList } from '../types/navigation';
import { Dimensions } from 'react-native';

// Import screens
import HistoryListScreen from '../screens/History/HistoryListScreen';
import HistoryCalendarScreen from '../screens/History/HistoryCalendarScreen';
import HistoryChartScreen from '../screens/History/HistoryChartScreen';
import ScanScreen from '../screens/Scan/ScanScreen';
import ResultDetailScreen from '../screens/Scan/ResultDetailScreen';
import ResultDetailWrapper from '../screens/History/ResultDetailWrapper';
import AccountMainScreen from '../screens/Account/AccountMainScreen';
import PersonalInfoScreen from '../screens/Account/PersonalInfoScreen';
import ChangeLanguageScreen from '../screens/Account/ChangeLanguageScreen';
import ChangePasswordScreen from '../screens/Account/ChangePasswordScreen';
import PackageScreen from '../screens/Account/PackageScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const HistoryStack = createStackNavigator<HistoryStackParamList>();
const AccountStack = createStackNavigator<AccountStackParamList>();
const ScanStack = createStackNavigator<ScanStackParamList>();
const { width, height } = Dimensions.get('window');
function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen
        name="HistoryList"
        component={HistoryListScreen}
        options={{ title: 'History' }}
      />
      <HistoryStack.Screen
        name="HistoryCalendar"
        component={HistoryCalendarScreen}
        options={{ title: 'Calendar Filter' }}
      />
      <HistoryStack.Screen
        name="HistoryChart"
        component={HistoryChartScreen}
        options={{ title: 'Chart Report' }}
      />
      <HistoryStack.Screen
        name="ResultDetail"
        component={ResultDetailWrapper}
        options={{ title: 'Result Detail' }}
      />
    </HistoryStack.Navigator>
  );
}

function ScanStackNavigator() {
  return (
    <ScanStack.Navigator screenOptions={{ headerShown: false }}>
      <ScanStack.Screen
        name="ScanMain"
        component={ScanScreen}
        options={{ title: 'Scan' }}
      />
      <ScanStack.Screen
        name="ResultDetail"
        component={ResultDetailScreen}
        options={{ title: 'Result Detail' }}
      />
    </ScanStack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen
        name="AccountMain"
        component={AccountMainScreen}
      />
      <AccountStack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
      />
      <AccountStack.Screen
        name="ChangeLanguage"
        component={ChangeLanguageScreen}
      />
      <AccountStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
      />
      <AccountStack.Screen
        name="Package"
        component={PackageScreen}
      />
    </AccountStack.Navigator>
  );
}

// Animated Icon Component
function AnimatedTabIcon({ routeName, color, size, focused }: {
  routeName: string;
  color: string;
  size: number;
  focused: boolean;
}) {
  let iconName: string;

  if (routeName === 'History') {
    iconName = 'clock';  
  } else if (routeName === 'Scan') {
    iconName = 'camera';  
  } else if (routeName === 'Account') {
    iconName = 'user'; 
  } else {
    iconName = 'help-circle';  
  }

  // Animation values
  const scale = useSharedValue(focused ? 1.0 : 0.85);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(focused ? 1 : 0.5);
  const translateY = useSharedValue(focused ? -4 : 4);

  // Update animations when focused state changes
  React.useEffect(() => {
    if (focused) {
      opacity.value = withSequence(
        withTiming(0.5, { duration: 80 }),
        withSpring(1, { damping: 12, stiffness: 180 })
      );
      scale.value = withSequence(
        withTiming(0.85, { duration: 80 }),
        withSpring(1.15, { damping: 12, stiffness: 180 }),
        withSpring(1.0, { damping: 10, stiffness: 120 })
      );
      translateY.value = withSequence(
        withTiming(8, { duration: 80 }),
        withSpring(-4, { damping: 12, stiffness: 180 }),
        withSpring(-2, { damping: 10, stiffness: 120 })
      );
    } else {
      //fade out, scale nhỏ, hạ xuống
      opacity.value = withTiming(0.5, { duration: 180 });
      scale.value = withTiming(0.85, { duration: 180 });
      translateY.value = withTiming(4, { duration: 180 });
    }

    // Hiệu ứng riêng cho từng icon
    if (routeName === 'History' && focused) {
      // Quay vòng khi active
      rotation.value = withRepeat(
        withTiming(-360, { duration: 1200 }),
        1,
        false
      );
    } else if (routeName === 'History' && !focused) {
      rotation.value = withTiming(0, { duration: 300 });
    } else if (routeName === 'Scan' && focused) {
      // Hiệu ứng "chụp ảnh" cho Scan icon
      rotation.value = withSequence(
        withTiming(-15, { duration: 80 }),
        withTiming(15, { duration: 80 }),
        withTiming(0, { duration: 80 })
      );
    } else if (routeName === 'Account' && focused) {
      // Hiệu ứng "gật đầu" cho Account icon
      rotation.value = withSequence(
        withTiming(8, { duration: 120 }),
        withTiming(-8, { duration: 120 }),
        withTiming(0, { duration: 120 })
      );
    } else {
      rotation.value = withTiming(0, { duration: 180 });
    }
  }, [focused, scale, rotation, opacity, translateY, routeName]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        name={iconName}
        size={size}
        color={color}
      />
    </Animated.View>
  );
}

export default function BottomTabNavigator() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const navigation = React.useRef<any>(null);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  // Keep a reference to the navigation object for use in the gesture handler
  const saveNavigationRef = (navRef: any) => {
    navigation.current = navRef;
  };
  
  // Function to navigate to tab by index
  const navigateToTab = (index: number) => {
    const tabNames = ['History', 'Scan', 'Account'];
    if (index >= 0 && index < tabNames.length && navigation.current) {
      navigation.current.navigate(tabNames[index]);
    }
  };

  // Swipe gesture handler
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20]) // Only activate after 20px horizontal movement
    .failOffsetY([-15, 15])   // Fail if there's more than 15px vertical movement
    .onStart(() => {
      // Reset animations when swipe starts
      opacity.value = 0;
    })
    .onUpdate((event) => {
      // Update swipe indicator based on gesture
      translateX.value = event.translationX;
      
      // Calculate opacity based on distance swiped (max 0.3 for subtle effect)
      opacity.value = Math.min(0.3, Math.abs(event.translationX) / 300);
    })
    .onEnd((event) => {
      // Reset animations
      translateX.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
      
      // Determine swipe direction based on velocity and distance
      const swipeDistance = event.translationX;
      const swipeVelocity = event.velocityX;
      const swipeThreshold = 80; // Minimum distance to consider it a swipe
      const velocityThreshold = 400; // Minimum velocity to consider it a swipe
      
      if (swipeDistance > swipeThreshold || swipeVelocity > velocityThreshold) {
        // Swipe right -> previous tab
        if (currentIndex > 0) {
          runOnJS(navigateToTab)(currentIndex - 1);
        }
      } else if (swipeDistance < -swipeThreshold || swipeVelocity < -velocityThreshold) {
        // Swipe left -> next tab
        if (currentIndex < 2) {
          runOnJS(navigateToTab)(currentIndex + 1);
        }
      }
    });

  // Animated style for swipe indicators
  const leftIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value > 0 ? opacity.value : 0,
      transform: [{ translateX: translateX.value > 0 ? translateX.value / 3 : 0 }],
    };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < 0 ? opacity.value : 0,
      transform: [{ translateX: translateX.value < 0 ? translateX.value / 3 : 0 }],
    };
  });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1 }}>
        <Animated.View 
          style={[
            leftIndicatorStyle
          ]} 
        />
        
        <Animated.View 
          style={[
            rightIndicatorStyle
          ]} 
        />
        
        <Tab.Navigator
          tabBar={props => {
            if (!navigation.current) {
              saveNavigationRef(props.navigation);
            }
            return <CustomTabBar {...props} />;
          }}
          screenOptions={{
            headerShown: false,
          }}
          screenListeners={{
            state: (e) => {
              const state = e.data.state as any;
              setCurrentIndex(state.index);
            }
          }}>
          <Tab.Screen name="History" component={HistoryStackNavigator} />
          <Tab.Screen name="Scan" component={ScanStackNavigator} />
          <Tab.Screen name="Account" component={AccountStackNavigator} />
        </Tab.Navigator>
      </View>
    </GestureDetector>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  // Animation cho notch background
  const notchTranslateX = useSharedValue(0);
  React.useEffect(() => {
    // Tính vị trí notch theo index
    const tabWidth = 1 / state.routes.length;
    notchTranslateX.value = withTiming(state.index * tabWidth, { duration: 300 });
  }, [state.index, state.routes.length]);

  // Animated style cho notch
  const animatedNotchStyle = useAnimatedStyle(() => {
    const tabBarWidth = width; 
    const tabWidthPx = tabBarWidth / state.routes.length;
    const notchCircleWidth = 64; 
    return {
      position: 'absolute',
      left: notchTranslateX.value * tabBarWidth + tabWidthPx / 2 - notchCircleWidth / 2 ,
      top: -6,
      zIndex: 2,
    };
  });

  return (
    <View style={[styles.tabBarContainer, { position: 'relative' }]}> 
      {/* Notch background di chuyển qua lại giữa các tab */}
      <Animated.View style={animatedNotchStyle}>
        <View style={styles.notchShadow} />
        <View style={styles.notchCircle}>
          <AnimatedTabIcon
            routeName={state.routes[state.index].name}
            color={'#fff'}
            size={32}
            focused={true}
          />
        </View>
      </Animated.View>
      {/* Các icon tab */}
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              activeOpacity={1}
              style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
              {!isFocused && (
                <View style={styles.iconWrapper}>
                  <AnimatedTabIcon
                    routeName={route.name}
                    color={'#5f5e5eff'}
                    size={30}
                    focused={false}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 70,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 0,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 66,
    height: 66,
  },
  notchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -1,
  },
  notchShadow: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    opacity: 0.18,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  notchCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: '#2196F3',
    zIndex: 10,
    opacity: 0,
  },
  leftIndicator: {
    left: 0,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  rightIndicator: {
    right: 0,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  }
});
