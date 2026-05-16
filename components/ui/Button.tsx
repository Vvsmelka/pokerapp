import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, radius, font, spacing } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.text} size="small" />
        : <Text style={[styles.label, variant !== 'primary' && styles.labelAlt]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: { backgroundColor: colors.text },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.red },
  disabled: { opacity: 0.4 },
  label: { fontSize: font.md, fontWeight: '600', color: colors.bg },
  labelAlt: { color: colors.text },
});
