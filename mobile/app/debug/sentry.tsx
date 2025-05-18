import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import * as Sentry from '@sentry/react-native';

export default function SentryDebugScreen() {
  const sendError = () => {
    try {
      throw new Error('Sentry smoke test error');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const sendMessage = () => {
    Sentry.captureMessage('Sentry smoke test message');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Sentry Debug</Text>
      <Button title="Send Test Message" onPress={sendMessage} />
      <View style={{ height: 12 }} />
      <Button title="Throw Test Error" color="red" onPress={sendError} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  h1: { fontSize: 24, marginBottom: 24 },
});
