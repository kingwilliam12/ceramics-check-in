import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { AuthStackParamList, AuthStackScreenProps } from '@navigation/types';
import { validatePassword } from '@utils/passwordValidation';

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    score: number;
    feedback: {
      suggestions: string[];
      warning: string;
    };
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { updatePassword } = useAuth();
  const route = useRoute<ResetPasswordRouteProp>();
  const navigation = useNavigation<AuthStackScreenProps['navigation']>();
  const { token } = route.params;

  // Validate password strength on change
  const validatePasswordStrength = useCallback(async (pwd: string) => {
    if (!pwd) {
      setPasswordStrength(null);
      return;
    }
    
    const result = validatePassword(pwd);
    setPasswordStrength(result);
    
    // Clear error if password is valid
    if (result.isValid) {
      setError('');
    }
  }, []);

  // Validate password when it changes
  useEffect(() => {
    validatePasswordStrength(password);
  }, [password, validatePasswordStrength]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Final password validation
    if (!passwordStrength?.isValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const { error: updateError } = await updatePassword(password);
      
      if (updateError) {
        setError(updateError.message || 'Failed to update password');
      } else {
        setMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Password update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Create a strong password for your account</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {message ? <Text style={styles.successText}>{message}</Text> : null}
        
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>New Password</Text>
            {passwordStrength && (
              <Text style={[
                styles.strengthText,
                passwordStrength.isValid ? styles.strengthValid : styles.strengthInvalid
              ]}>
                {passwordStrength.isValid ? 'Strong enough' : 'Too weak'}
              </Text>
            )}
          </View>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Enter new password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={styles.showHideButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Text style={styles.showHideText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Password strength meter */}
          {passwordStrength && (
            <View style={styles.strengthMeterContainer}>
              <View style={styles.strengthMeter}>
                <View 
                  style={[
                    styles.strengthMeterFill,
                    { 
                      width: `${(passwordStrength.score + 1) * 20}%`,
                      backgroundColor: passwordStrength.isValid ? '#10B981' : '#EF4444' 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.strengthScore}>
                Strength: {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength.score]}
              </Text>
            </View>
          )}
          
          {/* Password requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must include:</Text>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirementText,
                password.length >= 12 ? styles.requirementMet : null
              ]}>
                • At least 12 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirementText,
                /[A-Z]/.test(password) ? styles.requirementMet : null
              ]}>
                • At least one uppercase letter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirementText,
                /[a-z]/.test(password) ? styles.requirementMet : null
              ]}>
                • At least one lowercase letter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirementText,
                /[0-9]/.test(password) ? styles.requirementMet : null
              ]}>
                • At least one number
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirementText,
                /[!@#$%^&*(),.?":{}|<>]/.test(password) ? styles.requirementMet : null
              ]}>
                • At least one special character (!@#$%^&* etc.)
              </Text>
            </View>
            {passwordStrength?.feedback.warning ? (
              <Text style={styles.warningText}>
                {passwordStrength.feedback.warning}
              </Text>
            ) : null}
            {passwordStrength?.feedback.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                {passwordStrength.feedback.suggestions.map((suggestion, index) => (
                  <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Confirm new password"
              placeholderTextColor="#6B7280"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!isLoading}
              onSubmitEditing={handleResetPassword}
              returnKeyType="go"
            />
            <TouchableOpacity 
              style={styles.showHideButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <Text style={styles.showHideText}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          {confirmPassword && password !== confirmPassword && (
            <Text style={styles.errorTextSmall}>Passwords do not match</Text>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.button, 
              (isLoading || !passwordStrength?.isValid || password !== confirmPassword) && styles.buttonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={isLoading || !passwordStrength?.isValid || password !== confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.backButton, isLoading && styles.buttonDisabled]}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  formContainer: {
    padding: 20,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
    flex: 1,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  passwordInput: {
    borderWidth: 0,
    borderRightWidth: 1,
    borderColor: '#374151',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  showHideButton: {
    padding: 16,
  },
  showHideText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthValid: {
    color: '#10B981',
  },
  strengthInvalid: {
    color: '#EF4444',
  },
  strengthMeterContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  strengthMeter: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthMeterFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthScore: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  requirementsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  requirementsTitle: {
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    marginBottom: 4,
  },
  requirementText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  requirementMet: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  suggestionsTitle: {
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 8,
  },
  errorTextSmall: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    color: '#10B981',
    marginBottom: 16,
    textAlign: 'center',
  },
});
