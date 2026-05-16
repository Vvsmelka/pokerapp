import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, font, spacing, radius } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { joinRoom } from '../lib/room';

export default function JoinScreen() {
  const { playerId, playerName, playerAvatar, setRoom } = useGameStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 5) {
      Alert.alert('Invalid code', 'Enter the 5-character table code.');
      return;
    }
    setLoading(true);
    const player = { id: playerId, name: playerName, avatar: playerAvatar, chips: 500, seat: 0, isConnected: true, isHost: false };
    const room = await joinRoom(trimmed, player, 500);
    if (room) {
      setRoom(room);
      router.replace(`/lobby/${trimmed}`);
    } else {
      Alert.alert('Not found', 'Table not found or already started.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Join Table</Text>
        <Text style={styles.subtitle}>Enter the code shared by the host</Text>

        <View style={styles.codeContainer}>
          <Input
            value={code}
            onChangeText={v => setCode(v.toUpperCase())}
            placeholder="A7KD2"
            maxLength={5}
            autoCapitalize="characters"
            style={styles.codeInput}
          />
        </View>

        <Button label="Join Table" onPress={handleJoin} loading={loading} disabled={code.length !== 5} />
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
  codeContainer: { marginBottom: spacing.xl },
  codeInput: {},
});
