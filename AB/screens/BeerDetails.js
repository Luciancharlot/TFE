import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { ref, runTransaction } from 'firebase/database';
import { database } from '../firebase';

const { width, height } = Dimensions.get('window'); // Dimensions de l'écran

const BeerDetails = ({ route, navigation }) => {
  const { beer, tableInfo = {}, orderID = '' } = route.params || {}; // Valeurs par défaut
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!tableInfo?.table_id || !orderID) {
      Alert.alert('Error', 'Table information or order ID is missing.');
      return;
    }
    
    // Référence Firebase pour ajouter sous la bonne table/commande
    const beerRef = ref(database, `orders/${tableInfo.table_id}/${orderID}/${beer.id}`);
  
    runTransaction(beerRef, (currentData) => {
      if (currentData) {
        return { ...currentData, quantity: (currentData.quantity || 0) + quantity };
      }
      return { ...beer, quantity };
    })
      .then(() => navigation.goBack())
      .catch((error) => console.error('Error adding beer to cart:', error));
  };

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <View style={styles.container}>
      <Image source={{ uri: beer.image }} style={styles.image} resizeMode="contain" />
      <Text style={styles.name}>{beer.beer_name}</Text>
      <Text style={styles.info}>ABV: {beer.abv}%</Text>
      <Text style={styles.info}>Price: {beer.beer_price || 0} €</Text>

      <View style={styles.quantityContainer}>
        <TouchableOpacity style={styles.quantityButton} onPress={handleDecrease}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity style={styles.quantityButton} onPress={handleIncrease}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.6,
    height: height * 0.3,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  quantityButton: {
    backgroundColor: '#EC9D00',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#EC9D00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BeerDetails;
