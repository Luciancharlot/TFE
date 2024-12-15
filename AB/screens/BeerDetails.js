import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { ref, update, runTransaction } from 'firebase/database';
import { database } from '../firebase';

const BeerDetails = ({ route, navigation }) => {
  const { beer, orderID } = route.params;
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const beerRef = ref(database, `orders/${orderID}/${beer.id}`);

    runTransaction(beerRef, (currentData) => {
      if (currentData) {
        return { ...currentData, quantity: (currentData.quantity || 0) + quantity };
      }
      return { ...beer, quantity }; // If no data, initialize the beer with the current quantity
    })
      .then(() => navigation.goBack())
      .catch((error) => console.error('Error adding beer to cart:', error));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

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
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5', alignItems: 'center' },
  image: { width: '80%', height: 200, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  info: { fontSize: 16, marginBottom: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  quantityButton: { backgroundColor: '#EC9D00', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginHorizontal: 10 },
  quantityButtonText: { color: '#fff', fontSize: 18 },
  quantityText: { fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#EC9D00', padding: 16, borderRadius: 8 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default BeerDetails;
