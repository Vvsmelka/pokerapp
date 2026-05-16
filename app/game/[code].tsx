import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, font, spacing, radius } from '../../constants/theme';
import { useGameStore } from '../../store/useGameStore';
import { getRoom, updateRoom, subscribeToRoom } from '../../lib/room';
import { startRound, applyAction, applyWinnings, initGameState } from '../../lib/poker-engine';
import ActionBar from '../../components/game/ActionBar';
import PokerTable from '../../components/game/PokerTable';
import { GameState, Player, PlayerAction, Room } from '../../types';

const { height } = Dimensions.get('window');

export default function GameScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { playerId, room, setRoom, gameState, setGameState } = useGameStore();
  const [localRoom, setLocalRoom] = useState<Room | null>(room);
  const [showResult, setShowResult] = useState(false);
  const isHost = localRoom?.hostId === playerId;
  const me = localRoom?.players.find(p => p.id === playerId);
  const gs = localRoom?.game_state as GameState | undefined;
  const isMyTurn = gs?.currentSeat === me?.seat && gs?.phase !== 'showdown' && gs?.phase !== 'waiting';

  useEffect(() => {
    if (!code) return;
    getRoom(code).then(r => {
      if (r) {
        setLocalRoom(r);
        if (!r.game_state && isHost) {
          const players = r.players;
          const initial = initGameState(code, players, players[0]?.chips ?? 1000);
          const started = startRound(initial, players);
          updateRoom(code, { game_state: started });
        }
      }
    });
    const unsub = subscribeToRoom(code, r => {
      setLocalRoom(r);
      const gs = r.game_state as GameState | undefined;
      if (gs?.phase === 'showdown' && gs.winners) {
        setShowResult(true);
        if (isHost) {
          setTimeout(() => nextRound(r), 4000);
        }
      }
    });
    return unsub;
  }, [code]);

  const nextRound = async (r: Room) => {
    const gs = r.game_state as GameState;
    const updatedPlayers = applyWinnings(r.players, gs);
    const alive = updatedPlayers.filter(p => p.chips > 0);
    if (alive.length < 2) {
      await updateRoom(code, { status: 'finished', players: updatedPlayers, game_state: { ...gs, phase: 'waiting' } });
      return;
    }
    const newGs = startRound(gs, updatedPlayers);
    await updateRoom(code, { players: updatedPlayers, game_state: newGs });
    setShowResult(false);
  };

  const handleAction = async (action: PlayerAction, amount?: number) => {
    if (!localRoom || !me || !gs) return;
    const newGs = applyAction(gs, localRoom.players, me.seat, action, amount);
    await updateRoom(code, { game_state: newGs });
  };

  if (!localRoom) return null;

  const players = localRoom.players;
  const currentGs = localRoom.game_state as GameState | undefined;
  const currentBet = currentGs?.bets ? Math.max(...Object.values(currentGs.bets)) : 0;
  const myBet = currentGs?.bets?.[me?.seat ?? -1] ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.leaveBtn}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
        <Text style={styles.roomCode}>{code}</Text>
        <View style={styles.phase}>
          <Text style={styles.phaseText}>{currentGs?.phase?.toUpperCase() ?? 'WAITING'}</Text>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <PokerTable players={players} gameState={currentGs ?? null} myId={playerId} />
      </View>

      <View style={styles.bottom}>
        {isMyTurn && currentGs && me && (
          <ActionBar
            myChips={me.chips}
            currentBet={currentBet}
            myBet={myBet}
            pot={currentGs.pot}
            minRaise={currentGs.minRaise}
            bigBlind={currentGs.bigBlind}
            onAction={handleAction}
          />
        )}
        {!isMyTurn && currentGs?.phase !== 'waiting' && currentGs?.phase !== 'showdown' && (
          <View style={styles.waiting}>
            <Text style={styles.waitingText}>
              {currentGs?.currentSeat !== undefined
                ? `Waiting for ${players.find(p => p.seat === currentGs.currentSeat)?.name ?? '…'}`
                : 'Waiting…'}
            </Text>
          </View>
        )}
      </View>

      {showResult && currentGs?.winners && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.resultOverlay}>
          {currentGs.winners.map((w, i) => {
            const winner = players.find(p => p.seat === w.seat);
            return (
              <View key={i} style={styles.resultCard}>
                <Text style={styles.resultEmoji}>{winner?.avatar}</Text>
                <Text style={styles.resultName}>{winner?.name}</Text>
                <Text style={styles.resultHand}>{w.handName}</Text>
                <Text style={styles.resultAmount}>+{w.amount} ◉</Text>
              </View>
            );
          })}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  leaveBtn: { paddingVertical: spacing.sm, paddingRight: spacing.md },
  leaveText: { color: colors.textSecondary, fontSize: font.sm },
  roomCode: { flex: 1, textAlign: 'center', fontSize: font.md, fontWeight: '600', color: colors.text, letterSpacing: 2 },
  phase: { backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  phaseText: { fontSize: font.xs, color: colors.textSecondary, letterSpacing: 1 },
  tableContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.md },
  bottom: { minHeight: 80, justifyContent: 'center' },
  waiting: { alignItems: 'center', paddingVertical: spacing.lg },
  waitingText: { fontSize: font.sm, color: colors.textSecondary },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 200,
  },
  resultEmoji: { fontSize: 48, marginBottom: spacing.sm },
  resultName: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  resultHand: { fontSize: font.md, color: colors.textSecondary, marginTop: 4 },
  resultAmount: { fontSize: font.xl, fontWeight: '700', color: colors.yellow, marginTop: spacing.md },
});
