import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Button, Card, Text, Searchbar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';

type UserManagementScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'UserManagement'>;

type User = {
  id: string;
  email: string;
  full_name: string;
  status: string;
};

export const UserManagementScreen = () => {
  const navigation = useNavigation<UserManagementScreenNavigationProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('EditUser', { userId: item.id })}>
      <Card.Content>
        <Text variant="titleMedium">{item.full_name || 'No name'}</Text>
        <Text variant="bodyMedium" style={styles.email} numberOfLines={1}>
          {item.email}
        </Text>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: item.status === 'active' ? '#4CAF50' : '#9E9E9E' }
            ]} 
          />
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No users found' : 'No users available'}
          </Text>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddUser')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 8,
    paddingBottom: 16,
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  email: {
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
