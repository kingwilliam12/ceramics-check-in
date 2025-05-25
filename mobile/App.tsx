import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  console.log("Minimal App.tsx for iOS is rendering"); 
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Minimal App Loaded on iOS!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgreen' }, 
  text: { fontSize: 20, fontWeight: 'bold', color: 'black' },
});
