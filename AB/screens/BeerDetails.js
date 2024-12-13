import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';

const BeerDetails = ({ route, navigation }) => {
  const { beer, setCartCount } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddToCart = () => {
    setCartCount((prevCount) => prevCount + quantity);
    navigation.goBack();
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleEditQuantity = (value) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue > 0) {
      setQuantity(numericValue);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const contentWidth = screenWidth * 0.9; // 90% de la largeur de l'écran

  return (
    <View style={styles.container}>
      <View style={[styles.content, { width: contentWidth }]}>
        <Image
          source={{ uri: beer.image }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{beer.beer_name}</Text>
          <Text style={styles.info}>Description: {beer.beer_description}</Text>
          <Text style={styles.info}>ABV: {beer.abv}%</Text>
          <Text style={styles.info}>
            Price: <Text style={styles.price}>{beer.beer_price} €</Text>
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
    justifyContent: 'center', // Centre verticalement
    alignItems: 'center', // Centre horizontalement
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: '40%', // 40% de la largeur du contenu
    height: 200,
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
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
    justifyContent: 'center',
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
    textAlign: 'center',
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
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BeerDetails;
