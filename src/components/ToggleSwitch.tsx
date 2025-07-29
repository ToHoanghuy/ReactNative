import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';

interface ToggleSwitchProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  animationSpeed?: number;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isEnabled,
  onToggle,
  disabled = false,
  activeColor = '#2196F3',
  inactiveColor = '#666',
  animationSpeed = 250,
}) => {
  // Animation value for sliding effect
  const slideAnimation = useRef(new Animated.Value(isEnabled ? 1 : 0)).current;
  
  // Color animation for background color transition
  const colorAnimation = useRef(new Animated.Value(isEnabled ? 1 : 0)).current;
  
  // Update animation when isEnabled changes
  useEffect(() => {
    // Animate the switch position
    Animated.timing(slideAnimation, {
      toValue: isEnabled ? 1 : 0,
      duration: animationSpeed,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design standard easing
      useNativeDriver: false, // We need to animate non-transform/opacity properties
    }).start();
    
    // Animate the background color
    Animated.timing(colorAnimation, {
      toValue: isEnabled ? 1 : 0,
      duration: animationSpeed,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isEnabled, slideAnimation, colorAnimation, animationSpeed]);
  
  // Interpolate the position for the thumb
  const thumbPosition = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // Adjusted for 50x30 toggle with 26x26 thumb
  });
  
  // Interpolate the background color
  const backgroundColor = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.toggle,
          { backgroundColor },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: thumbPosition }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 0,
    justifyContent: 'center',
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});

export default ToggleSwitch;
