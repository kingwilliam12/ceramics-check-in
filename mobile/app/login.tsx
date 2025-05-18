import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient'; 
import { useRouter } from 'expo-router'; 

const LoginScreen = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

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
        console.error('Supabase login error:', error);
        Alert.alert(t('login.errorTitle'), error.message || t('login.errorUnexpected'));
      } else if (data.user) {
        Alert.alert(t('login.successTitle', 'Login Successful'), t('login.successMessage', 'Welcome back!')); 
        router.replace('/'); 
      } else {
        Alert.alert(t('login.errorTitle'), t('login.errorUnexpected'));
      }
    } catch (error: any) {
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

      {/* Placeholder for forgot password link */}
      {/* 
      <TouchableOpacity onPress={() => router.push('/forgot-password')}>
        <Text style={styles.linkText}>{t('login.forgotPassword')}</Text>
      </TouchableOpacity>
      */}

      {/* Placeholder for sign up link */}
      {/* 
      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.linkText}>{t('login.noAccountSignUp')}</Text>
      </TouchableOpacity>
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', 
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
    backgroundColor: '#007bff', 
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
