import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Card } from '../../types';
import { colors, radius } from '../../constants/theme';

interface Props {
  card?: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  index?: number;
}

const suitSymbol = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const suitColor = { spades: '#1C1C1E', hearts: colors.red, diamonds: colors.red, clubs: '#1C1C1E' };

export default function PlayingCard({ card, faceDown, size = 'md', index = 0 }: Props) {
  const s = sizes[size];
  if (faceDown || !card) {
    return (
      <Animated.View entering={FadeIn.delay(index * 80)} style={[styles.card, s, styles.back]}>
        <Text style={styles.backPattern}>◈</Text>
      </Animated.View>
    );
  }
  const color = suitColor[card.suit];
  const symbol = suitSymbol[card.suit];
  return (
    <Animated.View entering={FadeIn.delay(index * 80)} style={[styles.card, s]}>
      <Text style={[styles.rank, { color }, size === 'sm' && styles.rankSm]}>{card.rank}</Text>
      <Text style={[styles.suit, { color }, size === 'sm' && styles.suitSm]}>{symbol}</Text>
    </Animated.View>
  );
}

const sizes = {
  sm: { width: 32, height: 44 },
  md: { width: 44, height: 62 },
  lg: { width: 56, height: 78 },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAF8',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  back: { backgroundColor: '#1A1A2E' },
  backPattern: { fontSize: 16, color: '#2A2A4E' },
  rank: { fontSize: 16, fontWeight: '700', lineHeight: 18 },
  rankSm: { fontSize: 12, lineHeight: 14 },
  suit: { fontSize: 12, lineHeight: 14 },
  suitSm: { fontSize: 9 },
});
