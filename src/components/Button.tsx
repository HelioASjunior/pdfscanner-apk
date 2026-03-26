import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Radius, FontSize, FontWeight } from '../utils/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, style, textStyle, fullWidth,
}: ButtonProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && { width: '100%' as any },
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : Colors.accent}
        />
      ) : (
        <>
          {icon && <Text style={[styles.icon, styles[`labelSize_${size}`]]}>{icon}</Text>}
          <Text style={labelStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: Radius.md,
  },
  primary: { backgroundColor: Colors.accent },
  secondary: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  danger: { backgroundColor: Colors.danger },
  ghost: { backgroundColor: 'transparent' },

  size_sm: { paddingHorizontal: 12, paddingVertical: 7 },
  size_md: { paddingHorizontal: 18, paddingVertical: 11 },
  size_lg: { paddingHorizontal: 24, paddingVertical: 15 },

  disabled: { opacity: 0.5 },

  label: { fontWeight: FontWeight.semibold },
  label_primary: { color: '#fff' },
  label_secondary: { color: Colors.text },
  label_danger: { color: '#fff' },
  label_ghost: { color: Colors.accent },

  labelSize_sm: { fontSize: FontSize.sm },
  labelSize_md: { fontSize: FontSize.md },
  labelSize_lg: { fontSize: FontSize.lg },

  icon: { fontSize: FontSize.md },
});
