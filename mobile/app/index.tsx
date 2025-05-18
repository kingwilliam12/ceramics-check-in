import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import SwipeCheckIn from '../src/components/SwipeCheckIn';

export default function IndexScreen() {
  const handleSwipe = () => {
    console.log('✔ Checked in');
    // TODO: trigger Supabase mutation or enqueue offline task
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
