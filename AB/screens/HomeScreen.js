import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ref, push, update } from 'firebase/database';
import { database } from '../firebase';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleStartOrder = async () => {
    try {
      const newOrderRef = push(ref(database, 'orders'));
      const orderID = newOrderRef.key;
  
      // Ajout d'un objet vide pour initialiser l'order
      await update(ref(database, `orders/${orderID}`), { initialized: true });
  
      console.log('Order created with ID:', orderID); // Debug
      navigation.navigate('Order', { orderID });
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const openChatbot = () => {
    navigation.navigate('Chatbot');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your beer recommender</Text>

      <TouchableOpacity style={styles.button} onPress={handleStartOrder}>
        <Text style={styles.buttonText}>Order Beer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Analytics')}>
        <Text style={styles.buttonText}>Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.floatingButton} onPress={openChatbot}>
        <Image source={require('../assets/chat-icon.png')} style={styles.chatIcon} />
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#EC9D00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  chatIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
});

export default HomeScreen;
