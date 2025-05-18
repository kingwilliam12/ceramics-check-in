import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

// It's good practice to manage colors and styles centrally
// For now, we define them here, but consider moving to a theme/styles file.

const LoginScreen = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const navigation = useNavigation(); // If using react-navigation

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('login.errorTitle'), t('login.errorEmailPasswordRequired'));
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email,
        password: password,
      });

      if (error) {
        // Log the full error for debugging, but show a user-friendly message
        console.error('Supabase login error:', error);
        Alert.alert(t('login.errorTitle'), error.message || t('login.errorUnexpected'));
      } else if (data.user) {
        // Successful login
        // For now, just an alert. Later, you'd navigate or update global auth state.
        Alert.alert(t('login.successTitle', 'Login Successful'), t('login.successMessage', 'You are now logged in! User ID: ') + data.user.id);
        // navigation.navigate('AppMain'); // Example navigation
      } else {
        // Should not happen if there's no error and no user, but good to cover
        Alert.alert(t('login.errorTitle'), t('login.errorUnexpected'));
      }
    } catch (error: any) {
      // Catch any other unexpected errors during the async operation
      console.error('Unexpected error during login:', error);
      Alert.alert(t('login.errorTitle'), error.message || t('login.errorUnexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login.title')}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={t('login.emailPlaceholder')}
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      
      <TextInput
        style={styles.input}
        placeholder={t('login.passwordPlaceholder')}
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('login.loginButton')}</Text>
        )}
      </TouchableOpacity>

      {/* Placeholder for forgot password and sign up links */}
      {/* <TouchableOpacity onPress={() => {/* navigation.navigate('ForgotPassword') */}}>
        <Text style={styles.linkText}>{t('login.forgotPassword')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {/* navigation.navigate('SignUp') */}}>
        <Text style={styles.linkText}>{t('login.noAccountSignUp')}</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', // A light background color
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff', // A common primary color
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    marginTop: 15,
    fontSize: 16,
  },
});

export default LoginScreen;
