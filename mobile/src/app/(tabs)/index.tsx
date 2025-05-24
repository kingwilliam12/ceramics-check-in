import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>D&D Check-In</Text>
        <Text style={styles.subtitle}>Track your adventures</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.d20Icon}>🎲</Text>
        
        <Text style={styles.welcomeText}>
          Welcome to your D&D companion app. Track your characters, sessions, and more!
        </Text>
        
        <Text style={styles.noteText}>
          Note: Buttons are not functional yet. We'll implement them soon!
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, styles.disabledButton]}
            disabled={true}
            onPress={() => {}}
          >
            <Text style={styles.buttonText}>My Characters (Coming Soon)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, styles.disabledButton]}
            disabled={true}
            onPress={() => {}}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Session Log (Coming Soon)</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.footerText}>D&D Check-In v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0f0b',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e8c39e',
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#b5b5b5',
    marginTop: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: '#e8c39e',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#8b4513',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    width: '80%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#8b4513',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#e8c39e',
  },
  disabledButton: {
    opacity: 0.6,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontSize: 12,
  },
});
