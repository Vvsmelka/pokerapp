import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, font, spacing, radius } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';
import Button from '../components/ui/Button';
import { createRoom } from '../lib/room';
import { StackSize } from '../types';

const STACKS: { label: string; value: StackSize; desc: string }[] = [
  { label: '200', value: 200, desc: 'Quick session' },
  { label: '500', value: 500, desc: 'Standard' },
  { label: '1,000', value: 1000, desc: 'Deep stack' },
];

export default function CreateScreen() {
  const { playerId, playerName, playerAvatar, setRoom } = useGameStore();
  const [stack, setStack] = useState<StackSize>(500);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const player = { id: playerId, name: playerName, avatar: playerAvatar, chips: stack, seat: 0, isConnected: true, isHost: true };
    const room = await createRoom(player, stack);
    if (room) {
      setRoom(room);
      router.replace(`/lobby/${room.code}`);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>New Table</Text>
        <Text style={styles.subtitle}>Choose starting stack for all players</Text>

        <View style={styles.options}>
          {STACKS.map(s => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setStack(s.value)}
              activeOpacity={0.7}
              style={[styles.option, stack === s.value && styles.optionSelected]}
            >
              <Text style={[styles.optionChips, stack === s.value && styles.selectedText]}>{s.label}</Text>
              <Text style={styles.optionDesc}>{s.desc}</Text>
              <Text style={styles.chipIcon}>◉</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>Max 6 players · Texas Hold'em No Limit · Blinds 10/20</Text>
        </View>

        <Button label="Create Table" onPress={handleCreate} loading={loading} style={styles.btn} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  back: { marginBottom: spacing.xl },
  backText: { color: colors.textSecondary, fontSize: font.md },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: font.md, color: colors.textSecondary, marginBottom: spacing.xl },
  options: { gap: spacing.md, marginBottom: spacing.xl },
  option: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSelected: { borderColor: colors.text, backgroundColor: colors.surface },
  optionChips: { fontSize: font.xl, fontWeight: '700', color: colors.textSecondary, flex: 1 },
  selectedText: { color: colors.text },
  optionDesc: { fontSize: font.sm, color: colors.textTertiary },
  chipIcon: { fontSize: 20, color: colors.yellow, marginLeft: spacing.sm },
  info: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xl },
  infoText: { fontSize: font.sm, color: colors.textSecondary, textAlign: 'center' },
  btn: { marginTop: 'auto' as any, marginBottom: spacing.lg },
});
