import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { theme } from '@constants/theme';
import { SwipeCheckIn } from '@components/SwipeCheckIn';
import { Text } from '@components/Text';
import { checkInServices } from '@services/supabase';

interface UserStats {
  hoursThisWeek: number;
  visitsThisWeek: number;
  totalHours: number;
}

export const HomeScreen = () => {
  const { user, signOut, isLoading } = useAuth();
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    hoursThisWeek: 0,
    visitsThisWeek: 0,
    totalHours: 0,
  });

  // Fetch user stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        // TODO: Implement actual stats fetching from Supabase
        // This is a mock implementation
        setStats({
          hoursThisWeek: 12,
          visitsThisWeek: 3,
          totalHours: 42,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  const handleStatusChange = async (status: 'checked-in' | 'checked-out') => {
    // Refresh stats when check-in/out status changes
    if (status === 'checked-out') {
      try {
        // TODO: Update stats when user checks out
        // This is a mock implementation
        setStats(prev => ({
          ...prev,
          visitsThisWeek: prev.visitsThisWeek + 1,
          hoursThisWeek: prev.hoursThisWeek + 1, // This should be calculated based on actual session duration
        }));
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    }
  };

  if (isLoading || isCheckingStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
        </View>

        <View style={styles.content}>
          {/* Swipe Check-In Component */}
          <View style={styles.card}>
            <SwipeCheckIn onStatusChange={handleStatusChange} />
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.visitsThisWeek}</Text>
              <Text style={styles.statLabel}>Visits this week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.hoursThisWeek}</Text>
              <Text style={styles.statLabel}>Hours this week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalHours}</Text>
              <Text style={styles.statLabel}>Total hours</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.colors.text,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  signOutButton: {
    backgroundColor: theme.colors.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
