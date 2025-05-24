import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeScreen } from '@screens/HomeScreen';
import { ProfileScreen } from '@screens/ProfileScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { AdminStack } from './AdminStack';
import { theme } from '@constants/theme';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Define the tab bar icon styles
const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
  let iconName: keyof typeof Ionicons.glyphMap = 'home';

  switch (routeName) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Profile':
      iconName = focused ? 'person' : 'person-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    case 'Admin':
      iconName = focused ? 'shield' : 'shield-outline';
      break;
    default:
      break;
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export const MainTabNavigator = () => {
  const { user } = useAuth();
  
  // Determine if user has admin or staff role
  const userRole = user?.role as UserRole;
  const showAdminTab = userRole === 'admin' || userRole === 'staff';

  // Define tab bar options
  const tabBarOptions = useMemo(() => ({
    tabBarIcon: ({ focused, color, size }) => {
      return getTabBarIcon('Home', focused, color, size);
    },
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
    tabBarActiveBackgroundColor: theme.colors.surface,
    tabBarInactiveBackgroundColor: theme.colors.surface,
    tabBarStyle: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      marginBottom: 4,
    },
    headerShown: false,
    unmountOnBlur: true,
  }), [theme]);

  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      ...tabBarOptions,
      tabBarIcon: ({ focused, color, size }) => {
        return getTabBarIcon(route.name, focused, color, size);
      },
    })}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Home',
          tabBarTestID: 'home-tab',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarTestID: 'profile-tab',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          tabBarTestID: 'settings-tab',
        }}
      />
      {showAdminTab && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{
            title: 'Admin',
            tabBarTestID: 'admin-tab',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'shield' : 'shield-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};
