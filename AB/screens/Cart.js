import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { database } from '../firebase';
import { ref, onValue, update, remove } from 'firebase/database';

const Cart = ({ route, navigation }) => {
  const { orderID } = route.params;
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const orderRef = ref(database, `orders/${orderID}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCartItems(items);
        calculateSubtotal(items);
      } else {
        setCartItems([]);
        setSubtotal(0);
      }
    });

    return () => unsubscribe();
  }, [orderID]);

  const calculateSubtotal = (items) => {
    const total = items.reduce(
      (sum, item) => sum + (item.beer_price || 0) * item.quantity,
      0
    );
    setSubtotal(total.toFixed(2));
  };

  const handleIncrease = (item) => {
    const itemRef = ref(database, `orders/${orderID}/${item.id}`);
    update(itemRef, { quantity: item.quantity + 1 });
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      const itemRef = ref(database, `orders/${orderID}/${item.id}`);
      update(itemRef, { quantity: item.quantity - 1 });
    } else {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from the cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => handleRemove(item),
          },
        ]
      );
    }
  };

  const handleRemove = (item) => {
    const itemRef = ref(database, `orders/${orderID}/${item.id}`);
    remove(itemRef);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.beer_name}</Text>
        <Text style={styles.itemPrice}>
          {(item.beer_price || 0).toFixed(2)} €
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleDecrease(item)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleIncrease(item)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotalText}>Subtotal:</Text>
        <Text style={styles.subtotalValue}>{subtotal} €</Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>Close</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: '#EC9D00',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#970003',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EC9D00',
  },
  closeButton: {
    backgroundColor: '#EC9D00',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Cart;
