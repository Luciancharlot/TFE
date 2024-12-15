import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { database } from '../firebase';
import { ref, onValue, remove, update, get } from 'firebase/database';

const OrdersInProgress = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filteredOrders = Object.keys(data)
          .filter((orderID) => data[orderID].status === 'ordered')
          .map((orderID) => ({
            id: orderID,
            items: Object.values(data[orderID]).filter((item) => typeof item === 'object'),
          }));
        setOrders(filteredOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleValidate = async (order) => {
    try {
      const analyticsRef = ref(database, 'analytics'); // Référence principale pour analytics
  
      for (const item of order.items) {
        const beerName = item.beer_name; // Nom de la bière (pas modifié)
        const typeId = item.type_id || 'Unknown'; // Remplace undefined par "Unknown"
        const quantity = item.quantity || 0;
  
        // Ignorer les articles sans quantité ou nom valide
        if (!beerName || quantity <= 0) continue;
  
        // Construire une référence pour l'article de la bière
        const analyticsItemRef = ref(database, `analytics/${beerName}`);
  
        // Récupérer l'état actuel de l'entrée
        const snapshot = await get(analyticsItemRef);
  
        const currentDate = new Date().toISOString(); // Date actuelle sous forme ISO
  
        let updatedData = {
          quantity: quantity,
          type_name: typeId,
          dates: [currentDate],
        };
  
        if (snapshot.exists()) {
          // L'entrée existe déjà, on met à jour les données existantes
          const existingData = snapshot.val();
          updatedData.quantity = (existingData.quantity || 0) + quantity;
  
          // Fusionner les dates existantes avec la nouvelle date
          updatedData.dates = existingData.dates
            ? [...existingData.dates, currentDate]
            : [currentDate];
  
          updatedData.type_name = existingData.type_name || typeId; // Préserver le type_name
        }
  
        // Enregistrer les données mises à jour dans Firebase
        await update(analyticsItemRef, updatedData);
      }
  
      // Mettre à jour le statut de la commande comme "validated"
      const orderRef = ref(database, `orders/${order.id}`);
      await update(orderRef, { status: 'validated' });
  
      Alert.alert('Success', `Order ${order.id} validated successfully.`);
    } catch (error) {
      console.error('Error validating order:', error.message);
      Alert.alert('Error', 'Failed to validate the order.');
    }
  };
  
  

  const handleRemove = (order) => {
    Alert.alert(
      'Remove Order',
      `Are you sure you want to remove order ${order.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const orderRef = ref(database, `orders/${order.id}`);
            remove(orderRef).then(() => {
              Alert.alert('Success', `Order ${order.id} removed successfully.`);
            });
          },
        },
      ]
    );
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderTitle}>Order ID: {item.id}</Text>
      {item.items.map((beer, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text>
            {beer.beer_name} - {beer.quantity} pcs
          </Text>
        </View>
      ))}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.validateButton]}
          onPress={() => handleValidate(item)}
        >
          <Text style={styles.buttonText}>Validate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={() => handleRemove(item)}
        >
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders in Progress</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
      />
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
  orderContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemContainer: {
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  validateButton: {
    backgroundColor: '#28a745',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrdersInProgress;
