import React from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, font, spacing } from '../../constants/theme';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}

export default function Input({ value, onChangeText, placeholder, label, maxLength, autoCapitalize, style }: Props) {
  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: font.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 52,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: font.md,
  },
});
