import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Player, Card } from '../../types';
import { colors, radius, font, spacing } from '../../constants/theme';
import PlayingCard from './PlayingCard';

interface Props {
  player: Player;
  cards?: Card[];
  isActive: boolean;
  isDealer: boolean;
  isFolded: boolean;
  isAllin: boolean;
  bet: number;
  showCards: boolean;
  lastAction?: string;
}

export default function PlayerSeat({ player, cards, isActive, isDealer, isFolded, isAllin, bet, showCards, lastAction }: Props) {
  return (
    <Animated.View entering={FadeIn} style={[styles.container, isActive && styles.active, isFolded && styles.folded]}>
      {isDealer && <View style={styles.dealerBadge}><Text style={styles.dealerText}>D</Text></View>}

      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{player.avatar}</Text>
        {isActive && <View style={styles.activeDot} />}
      </View>

      <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
      <Text style={styles.chips}>{formatChips(player.chips)}</Text>

      {bet > 0 && <Text style={styles.bet}>{formatChips(bet)}</Text>}

      {lastAction && !isFolded && (
        <View style={styles.actionBubble}>
          <Text style={styles.actionText}>{lastAction}</Text>
        </View>
      )}

      {isAllin && (
        <View style={[styles.actionBubble, styles.allinBubble]}>
          <Text style={styles.actionText}>ALL IN</Text>
        </View>
      )}

      {cards && cards.length > 0 && (
        <View style={styles.cards}>
          {cards.map((card, i) => (
            <PlayingCard key={i} card={showCards ? card : undefined} faceDown={!showCards} size="sm" index={i} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

function formatChips(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    opacity: 1,
  },
  active: {},
  folded: { opacity: 0.35 },
  dealerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dealerText: { fontSize: 10, fontWeight: '700', color: '#000' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  avatarEmoji: { fontSize: 22 },
  activeDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.felt },
  name: { fontSize: font.xs, color: colors.text, fontWeight: '500', marginTop: 4, maxWidth: 72, textAlign: 'center' },
  chips: { fontSize: font.xs, color: colors.textSecondary, marginTop: 1 },
  bet: { fontSize: font.xs, color: colors.yellow, fontWeight: '600', marginTop: 2 },
  cards: { flexDirection: 'row', gap: 2, marginTop: 4 },
  actionBubble: { backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  allinBubble: { backgroundColor: colors.red + '33', borderWidth: 1, borderColor: colors.red },
  actionText: { fontSize: 9, color: colors.accent, fontWeight: '700' },
});
