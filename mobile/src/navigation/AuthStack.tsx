import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '@screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@screens/auth/ResetPasswordScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTitle: '',
        contentStyle: { backgroundColor: '#121212' },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ 
          headerShown: true,
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#121212' },
        }}
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{ 
          headerShown: true,
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#121212' },
        }}
      />
    </Stack.Navigator>
  );
};
