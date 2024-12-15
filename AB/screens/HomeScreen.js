import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ref, push, update, onValue } from 'firebase/database';
import { database } from '../firebase';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [beerOfTheMoment, setBeerOfTheMoment] = useState(null);
  const [beerImage, setBeerImage] = useState(null);
  const [typeOfTheMoment, setTypeOfTheMoment] = useState(null);
  const [beerTypes, setBeerTypes] = useState([]);

  useEffect(() => {
    const beersRef = ref(database, 'beers');
    const typesRef = ref(database, 'beer_types'); // Types de bières
    const analyticsRef = ref(database, 'analytics');

    // Charger les types de bières
    onValue(typesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBeerTypes(data);
      }
    }, { onlyOnce: true });

    // Charger les données d'analytics
    onValue(analyticsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let mostSoldBeer = null;
        let mostSoldTypeId = null;

        const beerQuantities = {};
        const typeQuantities = {};

        // Calculer les quantités des bières et des types
        Object.keys(data).forEach((beerName) => {
          const beerData = data[beerName];
          const quantity = beerData.quantity || 0;

          // Quantité pour chaque bière
          beerQuantities[beerName] = (beerQuantities[beerName] || 0) + quantity;

          // Quantité pour chaque type
          const typeId = beerData.type_name; // Utiliser type_name au lieu de type_id
          if (typeId) {
            typeQuantities[typeId] = (typeQuantities[typeId] || 0) + quantity;
          }
        });

        // Trouver la bière et le type les plus vendus
        if (Object.keys(beerQuantities).length > 0) {
          mostSoldBeer = Object.keys(beerQuantities).reduce((a, b) =>
            beerQuantities[a] > beerQuantities[b] ? a : b
          );
        }

        if (Object.keys(typeQuantities).length > 0) {
          mostSoldTypeId = Object.keys(typeQuantities).reduce((a, b) =>
            typeQuantities[a] > typeQuantities[b] ? a : b
          );
        }

        setBeerOfTheMoment(mostSoldBeer);

        // Récupérer le nom du type à partir de l'ID
        const typeName = beerTypes[mostSoldTypeId]?.type_name || 'Unknown';
        setTypeOfTheMoment(typeName);

        // Récupérer l'image de la bière la plus vendue
        onValue(beersRef, (beerSnapshot) => {
          const beersData = beerSnapshot.val();
          if (beersData) {
            const beerDetails = Object.values(beersData).find(
              (beer) => beer.beer_name === mostSoldBeer
            );
            setBeerImage(beerDetails?.image || null);
          }
        }, { onlyOnce: true });
      }
    }, { onlyOnce: true });
  }, [beerTypes]);

  const openChatbot = () => {
    navigation.navigate('Chatbot');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleStartOrder = async () => {
    try {
      const newOrderRef = push(ref(database, 'orders'));
      const orderID = newOrderRef.key;

      await update(ref(database, `orders/${orderID}`), { initialized: true });

      navigation.navigate('Order', { orderID });
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your beer recommender</Text>

      <TouchableOpacity style={styles.button} onPress={handleStartOrder}>
        <Text style={styles.buttonText}>Order Beer</Text>
      </TouchableOpacity>

      {/* Beer of the Moment Section */}
      {beerOfTheMoment && (
        <View style={styles.momentContainer}>
          <Text style={styles.momentTitle}>🍺 Beer of the Moment</Text>
          {beerImage && (
            <Image
              source={{ uri: beerImage }}
              style={styles.beerImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.momentHighlight}>{beerOfTheMoment}</Text>
        </View>
      )}

      {/* Type of the Moment Section 
      {typeOfTheMoment && (
        <View style={styles.momentContainer}>
          <Text style={styles.momentTitle}>🌟 Type of the Moment</Text>
          <Text style={styles.momentHighlight}>{typeOfTheMoment}</Text>
        </View>
      )}*/}

      {/* Bouton de login discret */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Professional Login</Text>
      </TouchableOpacity>

      {/* Bouton chatbot */}
      <TouchableOpacity style={styles.floatingButton} onPress={openChatbot}>
        <Image
          source={require('../assets/chat-icon.png')}
          style={styles.chatIcon}
        />
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
    paddingHorizontal: 20,
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
  momentContainer: {
    marginTop: 20,
    backgroundColor: '#FFF0C2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  momentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#D35400',
  },
  momentHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  beerImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
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
  loginButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
  },
  loginText: {
    color: '#8FC0A9',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
