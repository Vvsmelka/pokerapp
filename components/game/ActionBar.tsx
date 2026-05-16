import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radius, font, spacing } from '../../constants/theme';
import { PlayerAction } from '../../types';

interface Props {
  myChips: number;
  currentBet: number;
  myBet: number;
  pot: number;
  minRaise: number;
  bigBlind: number;
  onAction: (action: PlayerAction, amount?: number) => void;
}

export default function ActionBar({ myChips, currentBet, myBet, pot, minRaise, bigBlind, onAction }: Props) {
  const [raising, setRaising] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState('');

  const callAmount = Math.min(currentBet - myBet, myChips);
  const canCheck = callAmount === 0;
  const minRaiseTotal = currentBet + minRaise;
  const isAllin = myChips <= callAmount;

  const handleRaise = () => {
    const amount = parseInt(raiseAmount);
    if (!amount || amount < minRaiseTotal) return;
    onAction('raise', amount);
    setRaising(false);
    setRaiseAmount('');
  };

  if (raising) {
    return (
      <Animated.View entering={FadeInDown.duration(200)} style={styles.container}>
        <Text style={styles.raiseHint}>Min raise: {minRaiseTotal}</Text>
        <View style={styles.raiseRow}>
          <TouchableOpacity onPress={() => { setRaising(false); setRaiseAmount(''); }} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
          <TextInput
            value={raiseAmount}
            onChangeText={setRaiseAmount}
            keyboardType="number-pad"
            placeholder={String(minRaiseTotal)}
            placeholderTextColor={colors.textTertiary}
            style={styles.raiseInput}
            autoFocus
          />
          <QuickBet label="½ Pot" amount={Math.floor(pot / 2)} onPress={v => setRaiseAmount(String(v))} />
          <QuickBet label="Pot" amount={pot} onPress={v => setRaiseAmount(String(v))} />
          <TouchableOpacity onPress={handleRaise} style={styles.raiseConfirm}>
            <Text style={styles.raiseConfirmText}>Raise</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(200)} style={styles.container}>
      <ActionBtn label="Fold" color={colors.red} onPress={() => onAction('fold')} />
      {canCheck
        ? <ActionBtn label="Check" color={colors.textSecondary} onPress={() => onAction('check')} />
        : <ActionBtn label={`Call ${callAmount}`} color={colors.green} onPress={() => onAction('call')} />
      }
      {!isAllin && (
        <ActionBtn label="Raise" color={colors.blue} onPress={() => setRaising(true)} />
      )}
      <ActionBtn label="All In" color={colors.yellow} onPress={() => onAction('allin')} />
    </Animated.View>
  );
}

function ActionBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.btn, { borderColor: color + '66' }]}>
      <Text style={[styles.btnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickBet({ label, amount, onPress }: { label: string; amount: number; onPress: (v: number) => void }) {
  return (
    <TouchableOpacity onPress={() => onPress(amount)} style={styles.quickBtn}>
      <Text style={styles.quickText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: font.sm, fontWeight: '600' },
  raiseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  raiseHint: { fontSize: font.xs, color: colors.textSecondary, marginBottom: 4, textAlign: 'center' },
  raiseInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    fontSize: font.md,
  },
  cancelBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.textSecondary, fontSize: font.md },
  quickBtn: { paddingHorizontal: spacing.sm, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: radius.sm },
  quickText: { fontSize: font.xs, color: colors.accent },
  raiseConfirm: { height: 44, paddingHorizontal: spacing.md, backgroundColor: colors.blue, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  raiseConfirmText: { color: colors.text, fontWeight: '700', fontSize: font.sm },
});
