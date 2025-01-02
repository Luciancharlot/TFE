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
import { ref, onValue, remove, update, set,get } from 'firebase/database';

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
            if (['ordered', 'paid', 'to be reimbursed'].includes(orderData.status)) {
              fetchedOrders.push({
                id: orderID,
                tableID: tableID,
                paymentMethod: orderData.payment_method || 'unknown',
                status: orderData.status || 'ordered',
                timestamp: orderData.order_date || '',
                items: Object.values(orderData).filter((item) => typeof item === 'object'),
              });
            }
          });
        });
        fetchedOrders.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }

      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, []);

  const handleRemove = (order) => {
    if (order.status === 'paid') {
      Alert.alert(
        'Order Paid',
        `Order ${order.id} has already been paid. Do you want to refund it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            style: 'destructive',
            onPress: () => {
              const orderRef = ref(database, `orders/${order.tableID}/${order.id}`);
              update(orderRef, { status: 'to be reimbursed' })
                .then(() => {
                  Alert.alert('Success', `Order ${order.id} marked for reimbursement.`);
                })
                .catch((error) => console.error('Error updating order status:', error));
            },
          },
        ]
      );
    } else {
      const removedOrdersRef = ref(database, `removed_orders/${order.tableID}/${order.id}`);
      const orderRef = ref(database, `orders/${order.tableID}/${order.id}`);

      // Move the order to "removed_orders"
      set(removedOrdersRef, { ...order, removed_date: new Date().toISOString() })
        .then(() => {
          remove(orderRef) // Remove from "orders"
            .then(() => {
              setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));
              Alert.alert('Success', `Order ${order.id} moved to removed orders.`);
            })
            .catch((error) => console.error('Error removing order:', error));
        })
        .catch((error) => console.error('Error moving order:', error));
    }
  };

  const handleValidate = async (order) => {
    try {
        // Cas où le statut est "to be reimbursed"
        if (order.status === 'to be reimbursed') {
            const orderRef = ref(database, `orders/${order.tableID}/${order.id}`);
            await update(orderRef, { status: 'removed and reimbursed' });
            Alert.alert('Success', `Order ${order.id} marked as reimbursed.`);
            return; // Sortir de la fonction après avoir traité ce cas
        }

        // Cas de validation standard
        for (const item of order.items) {
          const beerName = item.beer_name;
          const typeId = item.type_id || 'Unknown';
          const quantity = item.quantity || 0;
          const price = item.beer_price || 0; // Récupère le prix actuel de la bière

          if (!beerName || quantity <= 0) continue;

          const analyticsItemRef = ref(database, `analytics/${beerName}`);
          const snapshot = await get(analyticsItemRef);

          const currentDate = new Date().toISOString();

          let updatedData;

          if (snapshot.exists()) {
              const existingData = snapshot.val();

              // Ajout d'une nouvelle entrée avec quantité, date, et prix
              updatedData = {
                  ...existingData,
                  dates: [
                      ...(existingData.dates || []),
                      { date: currentDate, quantity: quantity, price: price },
                  ],
              };
          } else {
              // Création de la nouvelle entrée
              updatedData = {
                  dates: [{ date: currentDate, quantity: quantity, price: price }],
                  type_name: typeId,
              };
          }

          await update(analyticsItemRef, updatedData);
      }

      // Mise à jour du statut de commande
      const orderRef = ref(database, `orders/${order.tableID}/${order.id}`);
      await update(orderRef, {
          status: 'validated',
          validated_date: new Date().toISOString(),
      });

      Alert.alert('Success', `Order ${order.id} validated successfully.`);
  } catch (error) {
      console.error('Error handling order validation:', error.message);
      Alert.alert('Error', 'Failed to handle the order validation.');
  }
};

  const handleReimbursed = async (order) => {
    try {
      // Mettre à jour le statut de la commande dans la base de données
      const orderRef = ref(database, `orders/${order.tableID}/${order.id}`);
      await update(orderRef, { status: 'removed and reimbursed' });
  
      Alert.alert('Success', `Order ${order.id} has been reimbursed and removed.`);
    } catch (error) {
      console.error('Error updating order status to reimbursed:', error.message);
      Alert.alert('Error', 'Failed to mark the order as reimbursed.');
    }
  };

  const renderOrder = ({ item }) => (
  <View style={styles.orderContainer}>
    <Text style={styles.orderTitle}>
      Table: {item.tableID} 
    </Text>
    {item.items.map((beer, index) => (
      <View key={index} style={styles.itemContainer}>
        <Text>
          <Text style={styles.beerName}>{beer.beer_name}</Text> {' '}
          <Text style={styles.hyphen}>-</Text>{' '}
          <Text style={styles.quantity}>{beer.quantity}</Text>{' '}
          <Text style={styles.pcs}>pcs</Text>
        </Text>
      </View>
    ))}
    <Text style={styles.paymentInfo}>
      Payment Method: {item.paymentMethod === 'paypal'
        ? '🅿️ PayPal'
        : item.paymentMethod === 'bancontact'
        ? '💳 Bancontact'
        : item.paymentMethod === 'cash'
        ? '💵 Cash'
        : '❓ Unknown'}
    </Text>
    <Text
      style={[
        styles.paymentStatus,
        { color: 
          item.status === 'paid'
            ? 'green'
            : item.status === 'to be reimbursed'
            ? 'orange'
            : 'red'
        },
      ]}
    >
      Status: {item.status === 'paid' 
        ? 'Paid' 
        : item.status === 'to be reimbursed' 
        ? 'To Be Reimbursed' 
        : 'Not Paid'}
    </Text>
    <Text style={styles.timestamp}>
        Ordered on: {new Date(item.timestamp).toLocaleString()}
      </Text>
    <View style={styles.actionButtons}>
      {item.status === 'to be reimbursed' ? (
        <TouchableOpacity
          style={[styles.button, styles.reimburseButton]}
          onPress={() => handleReimbursed(item)}
        >
          <Text style={styles.buttonText}>Reimburse</Text>
        </TouchableOpacity>
      ) : (
        <>
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
        </>
      )}
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
  paymentInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  paymentStatus: {
    fontSize: 14,
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
  reimburseButton: {
    backgroundColor: 'orange',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  beerName: {
    fontWeight: 'bold',
    fontSize: 25,
    color: '#EC9D00',
  },
  quantity: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  pcs: {
    fontSize: 14,
    color: '#666',
  },
  hyphen: {
    fontSize: 25,
    color: '#666',
    fontWeight: 'bold',
  },
  reimburseButton: {
    backgroundColor: 'orange',
  },
});

export default OrdersInProgress;
