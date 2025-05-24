import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { theme } from '@constants/theme';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.photo_url ? (
              <Image 
                source={{ uri: user.photo_url }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Personal Information</Text>
              <Text style={styles.menuItemSubtext}>Update your personal details</Text>
            </View>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Notification Preferences</Text>
              <Text style={styles.menuItemSubtext}>Manage your notifications</Text>
            </View>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Change Password</Text>
              <Text style={styles.menuItemSubtext}>Update your password</Text>
            </View>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Help Center</Text>
              <Text style={styles.menuItemSubtext}>Get help with the app</Text>
            </View>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Contact Support</Text>
              <Text style={styles.menuItemSubtext}>Reach out to our team</Text>
            </View>
            <Text style={styles.menuItemIcon}>›</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.h1,
    color: theme.colors.white,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  editButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  userEmail: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  menuItemLeft: {
    flex: 1,
  },
  menuItemText: {
    ...theme.typography.body1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xxs,
  },
  menuItemSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  menuItemIcon: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  signOutButton: {
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.md,
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
  },
});
