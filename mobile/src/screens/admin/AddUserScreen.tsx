import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { validateEmail } from '../../utils/validation';

type AddUserScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'AddUser'>;

export const AddUserScreen = () => {
  const navigation = useNavigation<AddUserScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const validateForm = () => {
    if (!email || !fullName || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    setError('');
    return true;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create member record in the database
      const { error: dbError } = await supabase.from('members').insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          status: 'active',
        },
      ]);

      if (dbError) throw dbError;

      // Show success message
      setSuccess(true);
      setSnackbarVisible(true);
      
      // Reset form
      setEmail('');
      setFullName('');
      setPassword('');
      setConfirmPassword('');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        Add New User
      </Text>

      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        mode="outlined"
        disabled={loading}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={loading}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        mode="outlined"
        secureTextEntry
        disabled={loading}
      />

      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        mode="outlined"
        secureTextEntry
        disabled={loading}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleAddUser}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Add User
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={success ? styles.successSnackbar : styles.errorSnackbar}
      >
        {success ? 'User added successfully!' : error}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
});
