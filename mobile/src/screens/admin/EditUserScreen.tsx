import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar, Switch, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { validateEmail } from '../../utils/validation';

type EditUserScreenRouteProp = RouteProp<AdminStackParamList, 'EditUser'>;
type EditUserScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'EditUser'>;

type UserData = {
  id: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
};

export const EditUserScreen = () => {
  const route = useRoute<EditUserScreenRouteProp>();
  const navigation = useNavigation<EditUserScreenNavigationProp>();
  const { userId } = route.params;
  
  const [user, setUser] = useState<UserData | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      // Get user data from members table
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .single();

      if (memberError) throw memberError;
      if (!memberData) throw new Error('User not found');

      // Get auth data
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) throw authError;
      
      const userData = {
        ...memberData,
        email: authData.user.email,
        last_sign_in_at: authData.user.last_sign_in_at,
      };

      setUser(userData);
      setEmail(userData.email);
      setFullName(userData.full_name || '');
      setStatus(userData.status || 'active');
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setSaving(true);
    setError('');

    try {
      // Update auth email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(userId, {
          email,
        });
        if (emailError) throw emailError;
      }

      // Update member data
      const { error: updateError } = await supabase
        .from('members')
        .update({
          full_name: fullName.trim(),
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess(true);
      setSnackbarVisible(true);
      
      // Update local user data
      setUser({
        ...user,
        email,
        full_name: fullName.trim(),
        status,
      });
      
      // Hide snackbar after 2 seconds
      setTimeout(() => setSnackbarVisible(false), 2000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.admin.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // Update with your app's URL scheme
      });

      if (error) throw error;
      
      setNewPassword('');
      setShowResetMenu(false);
      setSuccess(true);
      setError('Password reset email sent');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to send password reset email');
      setSnackbarVisible(true);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword) {
      setError('Please enter a new password');
      setSnackbarVisible(true);
      return;
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) throw error;
      
      setNewPassword('');
      setShowResetMenu(false);
      setSuccess(true);
      setError('Password updated successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password');
      setSnackbarVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text>User not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        Edit User
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={saving}
      />

      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        mode="outlined"
        disabled={saving}
      />

      <View style={styles.switchContainer}>
        <Text>Status: {status === 'active' ? 'Active' : 'Inactive'}</Text>
        <Switch
          value={status === 'active'}
          onValueChange={(value) => setStatus(value ? 'active' : 'inactive')}
          disabled={saving}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>User ID: </Text>
          <Text>{user.id}</Text>
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Created: </Text>
          <Text>{new Date(user.created_at).toLocaleString()}</Text>
        </Text>
        {user.last_sign_in_at && (
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Last Sign In: </Text>
            <Text>{new Date(user.last_sign_in_at).toLocaleString()}</Text>
          </Text>
        )}
      </View>

      <View style={styles.passwordContainer}>
        <Menu
          visible={showResetMenu}
          onDismiss={() => setShowResetMenu(false)}
          anchor={
            <Button 
              mode="outlined" 
              onPress={() => setShowResetMenu(true)}
              style={styles.resetButton}
            >
              Reset Password
            </Button>
          }
        >
          <Menu.Item 
            title="Send Reset Email" 
            onPress={handleResetPassword}
          />
          <Divider />
          <Menu.Item 
            title="Set New Password" 
            onPress={() => {}}
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.passwordInput}
              mode="outlined"
              secureTextEntry
              right={
                <TextInput.Icon 
                  icon="check" 
                  onPress={handleSetPassword}
                  disabled={!newPassword}
                />
              }
            />
          </View>
        </Menu>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.cancelButton]}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          loading={saving}
          disabled={saving}
        >
          Save Changes
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={success ? styles.successSnackbar : styles.errorSnackbar}
      >
        {success ? 'Changes saved successfully!' : error}
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  passwordContainer: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  resetButton: {
    marginBottom: 16,
  },
  passwordInputContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  passwordInput: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    marginRight: 8,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
});
