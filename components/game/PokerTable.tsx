import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GameState, Player } from '../../types';
import { colors, font, radius, spacing } from '../../constants/theme';
import PlayerSeat from './PlayerSeat';
import PlayingCard from './PlayingCard';

const { width } = Dimensions.get('window');
const TABLE_W = width - 32;
const TABLE_H = TABLE_W * 0.6;

interface Props {
  players: Player[];
  gameState: GameState | null;
  myId: string;
}

const SEAT_POSITIONS = [
  { top: TABLE_H * 0.72, left: TABLE_W * 0.5 - 40 },   // 0 bottom center (me)
  { top: TABLE_H * 0.72, left: TABLE_W * 0.15 },          // 1 bottom left
  { top: TABLE_H * 0.72, left: TABLE_W * 0.75 },          // 2 bottom right
  { top: TABLE_H * 0.05, left: TABLE_W * 0.15 },          // 3 top left
  { top: TABLE_H * 0.05, left: TABLE_W * 0.75 },          // 4 top right
  { top: TABLE_H * 0.05, left: TABLE_W * 0.5 - 40 },      // 5 top center
];

export default function PokerTable({ players, gameState, myId }: Props) {
  const me = players.find(p => p.id === myId);
  const orderedPlayers = me
    ? [me, ...players.filter(p => p.id !== myId)]
    : players;

  return (
    <View style={[styles.tableOuter, { width: TABLE_W, height: TABLE_H + 80 }]}>
      <View style={[styles.table, { width: TABLE_W, height: TABLE_H }]}>
        <View style={styles.felt}>
          {gameState?.phase !== 'waiting' && (
            <View style={styles.center}>
              <Text style={styles.potLabel}>POT</Text>
              <Text style={styles.pot}>{gameState?.pot ?? 0}</Text>
              <View style={styles.community}>
                {[0,1,2,3,4].map(i => {
                  const card = gameState?.communityCards?.[i];
                  const visible =
                    (gameState?.phase === 'flop' && i < 3) ||
                    (gameState?.phase === 'turn' && i < 4) ||
                    (gameState?.phase === 'river' && i < 5) ||
                    gameState?.phase === 'showdown';
                  return card && visible
                    ? <PlayingCard key={i} card={card} size="md" index={i} />
                    : <View key={i} style={styles.emptyCard} />;
                })}
              </View>
            </View>
          )}
        </View>

        {orderedPlayers.map((player, i) => {
          const pos = SEAT_POSITIONS[i % 6];
          const cards = gameState?.hands?.[player.seat];
          const isMe = player.id === myId;
          return (
            <View key={player.id} style={[styles.seatWrapper, { top: pos.top, left: pos.left }]}>
              <PlayerSeat
                player={player}
                cards={cards}
                isActive={gameState?.currentSeat === player.seat}
                isDealer={gameState?.dealerSeat === player.seat}
                isFolded={gameState?.folded?.includes(player.seat) ?? false}
                isAllin={gameState?.allin?.includes(player.seat) ?? false}
                bet={gameState?.bets?.[player.seat] ?? 0}
                showCards={isMe || gameState?.phase === 'showdown'}
                lastAction={gameState?.lastAction?.seat === player.seat ? gameState.lastAction.action : undefined}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tableOuter: { alignSelf: 'center' },
  table: {
    borderRadius: TABLE_W * 0.35,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#2A3F2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  felt: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.felt,
  },
  center: { position: 'absolute', top: '30%', left: 0, right: 0, alignItems: 'center' },
  potLabel: { fontSize: font.xs, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
  pot: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: 8 },
  community: { flexDirection: 'row', gap: 6 },
  emptyCard: { width: 44, height: 62, borderRadius: 6, backgroundColor: colors.feltDark, borderWidth: 1, borderColor: '#2A3F2A' },
  seatWrapper: { position: 'absolute' },
});
