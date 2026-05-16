import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, font, spacing, radius } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AVATARS = ['🎰', '🃏', '♠️', '🦊', '🐯', '🦁', '🐻', '🦅'];

export default function HomeScreen() {
  const { playerName, playerAvatar, setProfile } = useGameStore();
  const [name, setName] = useState(playerName);
  const [avatar, setAvatar] = useState(playerAvatar);
  const [showSetup, setShowSetup] = useState(!playerName);

  const handleContinue = () => {
    if (!name.trim()) return;
    setProfile(name.trim(), avatar);
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
          <Text style={styles.logo}>♠</Text>
          <Text style={styles.title}>Your Name</Text>
          <Text style={styles.subtitle}>How should others see you at the table?</Text>

          <View style={styles.avatarRow}>
            {AVATARS.map(a => (
              <Pressable key={a} onPress={() => setAvatar(a)}
                style={[styles.avatarOption, avatar === a && styles.avatarSelected]}>
                <Text style={styles.avatarEmoji}>{a}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            maxLength={16}
            style={styles.input}
          />

          <Button label="Continue" onPress={handleContinue} disabled={!name.trim()} style={styles.btn} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>♠</Text>
          <Text style={styles.appName}>Poker</Text>
          <TouchableOpacity onPress={() => setShowSetup(true)} style={styles.profileBtn}>
            <Text style={styles.profileEmoji}>{playerAvatar}</Text>
            <Text style={styles.profileName}>{playerName}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <Button label="Create Table" onPress={() => router.push('/create')} style={styles.btn} />
          <Button
            label="Join Table"
            onPress={() => router.push('/join')}
            variant="secondary"
            style={styles.btn}
          />
        </View>

        <Text style={styles.tagline}>Private games · No real money</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { fontSize: 64, marginBottom: spacing.sm },
  appName: { fontSize: font.xxxl, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  title: { fontSize: font.xxl, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: font.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  avatarOption: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  avatarSelected: { borderColor: colors.text },
  avatarEmoji: { fontSize: 24 },
  input: { marginBottom: spacing.xl },
  actions: { gap: spacing.md },
  btn: { marginTop: spacing.sm },
  tagline: { fontSize: font.sm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xxl },
  profileBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  profileEmoji: { fontSize: 18 },
  profileName: { fontSize: font.sm, color: colors.textSecondary },
});
