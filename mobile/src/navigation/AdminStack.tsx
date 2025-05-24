import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from './types';
import { AdminHomeScreen } from '../screens/admin/AdminHomeScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { AddUserScreen } from '../screens/admin/AddUserScreen';
import { EditUserScreen } from '../screens/admin/EditUserScreen';
import { AdminRoute } from '../components/RoleBasedRoute';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

const Stack = createNativeStackNavigator<AdminStackParamList>();

const UnauthorizedScreen = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.onBackground }]}>
        You don't have permission to access this area.
      </Text>
    </View>
  );
};

const AdminStackContent = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="AdminHome" 
        component={AdminHomeScreen} 
        options={{
          title: 'Admin Dashboard',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{
          title: 'Manage Users',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AddUser" 
        component={AddUserScreen}
        options={{
          title: 'Add New User',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="EditUser" 
        component={EditUserScreen}
        options={{
          title: 'Edit User',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export const AdminStack = () => {
  return (
    <AdminRoute fallback={<UnauthorizedScreen />}>
      <AdminStackContent />
    </AdminRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});
