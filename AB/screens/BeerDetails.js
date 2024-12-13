import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { database } from '../firebase';
import { ref, update,runTransaction } from 'firebase/database';

const BeerDetails = ({ route, navigation }) => {
  const { beer, orderID } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddToCart = async () => {
    try {
      const beerRef = ref(database, `orders/${orderID}/${beer.id}`);
  
      // Vérifiez si le nœud existe, sinon initialisez-le
      await update(beerRef, {
        ...beer,
        quantity: beer.quantity || 0, // Par défaut, quantité = 0
      });
  
      // Utilisez une transaction pour mettre à jour la quantité
      await runTransaction(beerRef, (currentData) => {
        if (currentData) {
          return { ...currentData, quantity: (currentData.quantity || 0) + quantity };
        } else {
          return { ...beer, quantity };
        }
      });
  
      console.log('Beer successfully added to the cart');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding beer to cart:', error);
    }
  };

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => quantity > 1 && setQuantity((prev) => prev - 1);

  const handleEditQuantity = (value) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue > 0) {
      setQuantity(numericValue);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <Image source={{ uri: beer.image }} style={styles.image} resizeMode="contain" />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{beer.beer_name}</Text>
          <Text style={styles.description}>{beer.beer_description}</Text>
          <Text style={styles.info}>ABV: {beer.abv}%</Text>
          <Text style={styles.info}>
            Price: <Text style={styles.price}>{beer.beer_price || 0} €</Text>
          </Text>
        </View>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity style={styles.quantityButton} onPress={handleDecrease}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>

        {isEditing ? (
          <TextInput
            style={styles.quantityInput}
            value={quantity.toString()}
            keyboardType="numeric"
            onBlur={() => setIsEditing(false)}
            onChangeText={handleEditQuantity}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </TouchableOpacity>
        )}

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
    padding: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: '40%',
    height: 200,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: '#EC9D00',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  quantityButton: {
    backgroundColor: '#EC9D00',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 20,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityInput: {
    borderBottomWidth: 1,
    borderColor: '#CCC',
    fontSize: 18,
    textAlign: 'center',
    width: 60,
    paddingVertical: 4,
  },
  addButton: {
    backgroundColor: '#EC9D00',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BeerDetails;
