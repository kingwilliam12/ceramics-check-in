import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';

type AdminHomeScreenNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminHome'>;

export const AdminHomeScreen = () => {
  const navigation = useNavigation<AdminHomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('UserManagement')}
          style={styles.button}
        >
          Manage Users
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
  },
});
