import React from 'react';
import { Stack } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';
import useBackgroundGeofence from '../src/hooks/useBackgroundGeofence';

Sentry.init({
  dsn: 'https://example@sentry.io/12345',
});

export default function RootLayout() {
  useBackgroundGeofence();
  return (
    <I18nextProvider i18n={i18n}>
      <Stack />
    </I18nextProvider>
  );
}
