import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { theme } from '@constants/theme';

export const SettingsScreen = () => {
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const toggleSwitch = (setting: string) => {
    switch (setting) {
      case 'notifications':
        setNotificationsEnabled(previousState => !previousState);
        break;
      case 'darkMode':
        setDarkMode(previousState => !previousState);
        break;
      case 'biometric':
        setBiometricEnabled(previousState => !previousState);
        break;
    }
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange = () => {},
    onPress = null,
    isLast = false 
  }: {
    title: string;
    subtitle: string;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    onPress?: (() => void) | null;
    isLast?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, !isLast && styles.settingItemBorder]}
      onPress={onPress || (() => {})}
      disabled={!onPress}
    >
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {showSwitch ? (
        <Switch
          trackColor={{ false: theme.colors.gray[700], true: theme.colors.primary }}
          thumbColor={theme.colors.white}
          ios_backgroundColor={theme.colors.gray[700]}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <Text style={styles.arrowIcon}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem 
            title="Dark Mode" 
            subtitle="Enable dark theme" 
            showSwitch 
            switchValue={darkMode}
            onSwitchChange={() => toggleSwitch('darkMode')}
          />
          
          <SettingItem 
            title="Enable Notifications" 
            subtitle="Receive app notifications" 
            showSwitch 
            switchValue={notificationsEnabled}
            onSwitchChange={() => toggleSwitch('notifications')}
          />
          
          <SettingItem 
            title="Biometric Login" 
            subtitle="Use fingerprint or face ID" 
            showSwitch 
            switchValue={biometricEnabled}
            onSwitchChange={() => toggleSwitch('biometric')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem 
            title="Change Email" 
            subtitle="Update your email address"
            onPress={() => {}}
          />
          
          <SettingItem 
            title="Change Password" 
            subtitle="Update your password"
            onPress={() => {}}
          />
          
          <SettingItem 
            title="Privacy Settings" 
            subtitle="Manage your privacy"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem 
            title="Help Center" 
            subtitle="Get help with the app"
            onPress={() => {}}
          />
          
          <SettingItem 
            title="Contact Support" 
            subtitle="Reach out to our team"
            onPress={() => {}}
          />
          
          <SettingItem 
            title="About" 
            subtitle="App version and information"
            onPress={() => {}}
            isLast
          />
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    margin: theme.spacing.md,
    marginBottom: 0,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    minHeight: 70,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  settingTitle: {
    ...theme.typography.body1,
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  arrowIcon: {
    ...theme.typography.h2,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
  signOutButton: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  signOutButtonText: {
    ...theme.typography.button,
    color: theme.colors.error,
  },
  versionText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
