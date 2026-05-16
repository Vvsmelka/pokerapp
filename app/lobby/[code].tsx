import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, font, spacing, radius } from '../../constants/theme';
import { useGameStore } from '../../store/useGameStore';
import Button from '../../components/ui/Button';
import { getRoom, updateRoom, subscribeToRoom } from '../../lib/room';
import { Room } from '../../types';

export default function LobbyScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { playerId, room, setRoom } = useGameStore();
  const [loading, setLoading] = useState(false);
  const isHost = room?.hostId === playerId;

  useEffect(() => {
    if (!code) return;
    getRoom(code).then(r => r && setRoom(r));
    const unsub = subscribeToRoom(code, r => {
      setRoom(r);
      if (r.status === 'playing') {
        router.replace(`/game/${code}`);
      }
    });
    return unsub;
  }, [code]);

  const handleStart = async () => {
    if (!room || room.players.length < 2) {
      Alert.alert('Need more players', 'At least 2 players to start.');
      return;
    }
    setLoading(true);
    await updateRoom(code, { status: 'playing' });
    router.replace(`/game/${code}`);
    setLoading(false);
  };

  const handleShare = () => {
    Share.share({ message: `Join my poker table! Code: ${code}` });
  };

  const players = room?.players ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
        <Text style={styles.title}>Table</Text>

        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>INVITE CODE</Text>
          <Text style={styles.code}>{code}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Players ({players.length}/6)</Text>
        <View style={styles.playerList}>
          {players.map((p, i) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(i * 60)} style={styles.playerRow}>
              <Text style={styles.playerEmoji}>{p.avatar}</Text>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{p.name} {p.isHost ? '(Host)' : ''}</Text>
                <Text style={styles.playerChips}>{p.chips} chips</Text>
              </View>
              <View style={[styles.dot, { backgroundColor: colors.green }]} />
            </Animated.View>
          ))}
          {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
            <View key={`empty-${i}`} style={[styles.playerRow, styles.emptyRow]}>
              <Text style={styles.emptyText}>Waiting…</Text>
            </View>
          ))}
        </View>

        {isHost ? (
          <Button
            label={`Start Game · ${players.length} players`}
            onPress={handleStart}
            loading={loading}
            disabled={players.length < 2}
            style={styles.startBtn}
          />
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Waiting for host to start…</Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.xl },
  codeBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.xl,
  },
  codeLabel: { fontSize: font.xs, color: colors.textSecondary, letterSpacing: 3, marginBottom: spacing.sm },
  code: { fontSize: font.xxxl, fontWeight: '700', color: colors.text, letterSpacing: 8 },
  shareBtn: { marginTop: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.cardBorder },
  shareText: { color: colors.textSecondary, fontSize: font.sm },
  sectionLabel: { fontSize: font.sm, color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.md },
  playerList: { gap: spacing.sm, flex: 1 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  emptyRow: { borderStyle: 'dashed', opacity: 0.4 },
  playerEmoji: { fontSize: 24 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: font.md, color: colors.text, fontWeight: '500' },
  playerChips: { fontSize: font.sm, color: colors.textSecondary },
  dot: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { fontSize: font.sm, color: colors.textTertiary },
  startBtn: { marginBottom: spacing.lg },
  waitingContainer: { alignItems: 'center', paddingBottom: spacing.xxl },
  waitingText: { fontSize: font.md, color: colors.textSecondary },
});
