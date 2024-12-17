import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ProfessionalHome = ({ navigation }) => {
  const handleViewOrders = () => {
    navigation.navigate('OrdersInProgress'); // Navigue vers la page des commandes en cours
  };

  const handleViewAnalytics = () => {
    navigation.navigate('ProAnalytics'); // Navigue vers la page des analyses
  };
  const handleHomeScreen = () => {
    navigation.navigate('Home'); // Navigue vers la page des analyses
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Professional Dashboard</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleViewOrders}
      >
        <Text style={styles.buttonText}>View Orders in Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleViewAnalytics}
      >
        <Text style={styles.buttonText}>View Analytics</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleHomeScreen}
      >
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: '#8FC0A9',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfessionalHome;
