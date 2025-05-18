import React from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import SwipeCheckIn from '../src/components/SwipeCheckIn';

export default function IndexScreen() {
  const router = useRouter();
  const handleSwipe = () => {
    const last = new Date().toISOString();
    router.push({ pathname: '/status', params: { last } });
  };

  return (
    <View style={styles.container}>
      <SwipeCheckIn onSwipe={handleSwipe} />
    </View>
  );
}

IndexScreen.options = {
  title: 'Check-In',
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
});
