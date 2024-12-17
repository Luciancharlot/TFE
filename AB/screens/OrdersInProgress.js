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
      const fetchedOrders = [];

      if (data) {
        Object.keys(data).forEach((tableID) => {
          Object.keys(data[tableID]).forEach((orderID) => {
            const orderData = data[tableID][orderID];
            if (orderData.status === 'ordered') {
              fetchedOrders.push({
                id: orderID,
                tableID: tableID,
                items: Object.values(orderData).filter(
                  (item) => typeof item === 'object'
                ),
              });
            }
          });
        });
      }

      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, []);

  const handleValidate = async (order) => {
    try {
      const analyticsRef = ref(database, 'analytics');

      for (const item of order.items) {
        const beerName = item.beer_name;
        const typeId = item.type_id || 'Unknown';
        const quantity = item.quantity || 0;

        if (!beerName || quantity <= 0) continue;

        const analyticsItemRef = ref(database, `analytics/${beerName}`);
        const snapshot = await get(analyticsItemRef);

        const currentDate = new Date().toISOString();

        let updatedData = {
          quantity: quantity,
          type_name: typeId,
          dates: [currentDate],
        };

        if (snapshot.exists()) {
          const existingData = snapshot.val();
          updatedData.quantity = (existingData.quantity || 0) + quantity;
          updatedData.dates = existingData.dates
            ? [...existingData.dates, currentDate]
            : [currentDate];
          updatedData.type_name = existingData.type_name || typeId;
        }

        await update(analyticsItemRef, updatedData);
      }

      const orderRef = ref(database, `orders/${order.tableID}/${order.id}`);
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
            const orderRef = ref(database, `orders/${order.tableID}/${order.id}`);
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
      <Text style={styles.orderTitle}>
        Table: {item.tableID} | Order ID: {item.id}
      </Text>
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
