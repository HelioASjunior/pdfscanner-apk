import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, StyleSheet } from 'react-native';
import { Colors, Radius, FontSize } from '../utils/theme';

interface Props {
  progress: number; // 0-100
  label?: string;
  showPercent?: boolean;
  height?: number;
  color?: string;
}

export default function ProgressBar({
  progress, label, showPercent = true, height = 6, color = Colors.accent,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(100, Math.max(0, progress)),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && <Text style={styles.percent}>{Math.round(progress)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color, height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: FontSize.sm, color: Colors.text2 },
  percent: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.accent2 },
  track: { backgroundColor: Colors.surface3, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { borderRadius: Radius.full },
});
