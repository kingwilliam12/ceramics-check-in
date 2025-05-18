import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';
import useBackgroundGeofence from '../src/hooks/useBackgroundGeofence';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'; 
import { ActivityIndicator, View } from 'react-native'; 

Sentry.init({
  dsn: 'https://example@sentry.io/12345', 
  // tracesSampleRate: 1.0, 
});

const AppLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments(); 
  const router = useRouter();

  useBackgroundGeofence(); 

  useEffect(() => {
    if (isLoading) return; 

    const inAuthGroup = segments[0] === '(auth)'; 
    const inAppGroup = segments.length > 0 && segments[0] !== 'login'; 

    if (!user && inAppGroup && segments[0] !== '[...404]') {
      router.replace('/login'); 
    } else if (user && segments[0] === 'login') {
      router.replace('/');
    }
  }, [user, segments, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Check-In / Out' }} />
        <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
        {/* Add other global screen options or screens here */}
        {/* e.g., <Stack.Screen name="status" options={{ title: 'Status' }} /> */}
        {/* Ensure your [...404].tsx or similar catch-all is handled or defined if needed */}
      </Stack>
    </I18nextProvider>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
