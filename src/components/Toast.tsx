import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, FontSize } from '../utils/theme';

interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'default' | 'success' | 'error';
  duration?: number;
  onHide?: () => void;
}

export default function Toast({ message, visible, type = 'default', duration = 2000, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message]);

  const bgColor: Record<string, string> = {
    default: Colors.surface3,
    success: 'rgba(34,197,94,0.15)',
    error: 'rgba(239,68,68,0.15)',
  };

  const icon: Record<string, string> = {
    default: '',
    success: '✅ ',
    error: '❌ ',
  };

  return (
    <Animated.View
      style={[styles.toast, { opacity, transform: [{ translateY }], backgroundColor: bgColor[type] }]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{icon[type]}{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100, alignSelf: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
    zIndex: 999,
  },
  text: {
    fontSize: FontSize.sm, fontWeight: '500', color: Colors.text,
  },
});
