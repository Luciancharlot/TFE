import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebase'; // Importez l'authentification configurée
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Importer les méthodes nécessaires
import BackButton from '../components/BackButton';

const ProfessionalHome = ({ navigation }) => {
  const [user, setUser] = useState(null);

  // Vérifier si un utilisateur est connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigation.replace('Login'); // Redirige vers l'écran de connexion si l'utilisateur n'est pas connecté
      }
    });

    return unsubscribe; // Nettoyer l'écouteur à la fin
  }, [navigation]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'You have been logged out.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Gérer la navigation
  const handleViewOrders = () => {
    navigation.navigate('OrdersInProgress');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('ProAnalytics');
  };

  const handleHomeScreen = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {user && (
        <Text style={styles.welcomeText}>
          Welcome, {user.email}
        </Text>
      )}
      <Text style={styles.title}>Professional Dashboard</Text>

      <TouchableOpacity style={styles.button} onPress={handleViewOrders}>
        <Text style={styles.buttonText}>View Orders in Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleViewAnalytics}>
        <Text style={styles.buttonText}>View Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleHomeScreen}>
        <Text style={styles.buttonText}>Go Back Home</Text>
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
  welcomeText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
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
