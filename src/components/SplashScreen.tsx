import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface SplashScreenProps {
  isLoading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  const dot1TranslateX = useSharedValue(0);
  const dot2TranslateX = useSharedValue(0);
  const dot3TranslateX = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      // Dot 1 animation
      dot1TranslateX.value = withRepeat(
        withSequence(
          withTiming(20, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Dot 2 animation with delay
      dot2TranslateX.value = withRepeat(
        withSequence(
          withDelay(
            150,
            withTiming(20, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Dot 3 animation with more delay
      dot3TranslateX.value = withRepeat(
        withSequence(
          withDelay(
            300,
            withTiming(20, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [isLoading]);

  const dotStyle = (translateXValue: any) =>
    useAnimatedStyle(() => ({
      transform: [{ translateX: translateXValue.value }],
    }));

  return (
    <View style={[styles.container, { display: isLoading ? 'flex' : 'none' }]}>
      <View style={styles.overlay} />
      <View style={styles.loadingDots}>
        <Animated.View style={[styles.dot, dotStyle(dot1TranslateX)]} />
        <Animated.View style={[styles.dot, dotStyle(dot2TranslateX)]} />
        <Animated.View style={[styles.dot, dotStyle(dot3TranslateX)]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    marginHorizontal: 5,
  },
});

export default SplashScreen;
