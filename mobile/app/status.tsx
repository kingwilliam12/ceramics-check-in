import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function StatusScreen() {
  const params = useLocalSearchParams<{ last?: string }>();
  const last = params.last ?? 'unknown';
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.h1}>Status</Text>
      <Text>Last check-in: {last}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: { fontSize: 24, marginBottom: 12 },
});
