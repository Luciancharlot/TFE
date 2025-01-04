import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { database } from '../firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import BackButton from '../components/BackButton';

const Cart = ({ route, navigation }) => {
  const { orderID, tableInfo } = route.params; // Récupération de tableInfo et orderID
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null); // Moyen de paiement
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false); // État pour la simulation de paiement

  useEffect(() => {
    // Utilisation correcte de tableInfo.table_id
    const orderRef = ref(database, `orders/${tableInfo.table_id}/${orderID}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((item) => item.quantity > 0 && item.beer_name);

        setCartItems(items);
        calculateSubtotal(items);
      } else {
        setCartItems([]);
        setSubtotal(0);
      }
    });

    return () => unsubscribe();
  }, [orderID, tableInfo]);

  const calculateSubtotal = (items) => {
    const total = items.reduce(
      (sum, item) => sum + (item.beer_price || 0) * item.quantity,
      0
    );
    setSubtotal(total.toFixed(2));
  };

  const handleIncrease = (item) => {
    const itemRef = ref(database, `orders/${tableInfo.table_id}/${orderID}/${item.id}`);
    update(itemRef, { quantity: item.quantity + 1 });
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      const itemRef = ref(database, `orders/${tableInfo.table_id}/${orderID}/${item.id}`);
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
    const itemRef = ref(database, `orders/${tableInfo.table_id}/${orderID}/${item.id}`);
    remove(itemRef)
      .then(() => {
        console.log(`${item.beer_name} removed from cart`);
      })
      .catch((error) => console.error('Error removing item:', error));
  };

  const handleRemoveAll = () => {
    const orderRef = ref(database, `orders/${tableInfo.table_id}/${orderID}`);
    remove(orderRef)
      .then(() => {
        setCartItems([]);
        setSubtotal(0);
        console.log('All items removed from cart');
      })
      .catch((error) => console.error('Error removing all items:', error));
  };

  const handlePayPalSimulation = () => {
    setIsPaymentModalVisible(true);
  };

  const confirmPayment = () => {
    setIsPaymentModalVisible(false);
    const orderRef = ref(database, `orders/${tableInfo.table_id}/${orderID}`);
    update(orderRef, { 
      status: 'paid', 
      payment_method: 'paypal',
      order_date: new Date().toISOString(),})
      .then(() => {
        console.log('Order status updated to "paid"');
        navigation.navigate('Home')
      })
      .catch((error) => console.error('Error updating order status:', error));
  };

  const handleOrder = () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method before ordering.');
      return;
    }

    if (paymentMethod === 'paypal') {
      handlePayPalSimulation();
    } else {
      const orderRef = ref(database, `orders/${tableInfo.table_id}/${orderID}`);
      const timestamp = new Date().toISOString(); // Génère une date/heure actuelle au format ISO.
      update(orderRef, { 
        status: 'ordered',
        payment_method: paymentMethod,
        order_date: timestamp,
       })
        .then(() => {
          console.log('Order status updated to "ordered"');
          navigation.navigate('Home')
        })
        .catch((error) => console.error('Error updating order status:', error));
    }
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

  const renderPaymentMethod = (method, label, imageUri) => (
    <TouchableOpacity
      style={[
        styles.paymentOption,
        paymentMethod === method && styles.paymentOptionSelected,
      ]}
      onPress={() => setPaymentMethod(method)}
    >
      <Image source={{ uri: imageUri }} style={styles.paymentIcon} />
      <Text style={styles.paymentLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.removeAllButton} onPress={handleRemoveAll}>
        <Text style={styles.removeAllText}>Remove All</Text>
      </TouchableOpacity>
      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotalText}>Subtotal:</Text>
        <Text style={styles.subtotalValue}>{subtotal} €</Text>
      </View>

      <View style={styles.paymentContainer}>
        <Text style={styles.paymentTitle}>Select Payment Method:</Text>
        <View style={styles.paymentOptionsContainer}>
          {renderPaymentMethod(
            'paypal',
            'PayPal',
            'https://cdn-icons-png.flaticon.com/512/2504/2504802.png' // Remplacez par l'URL réelle
          )}
          {renderPaymentMethod(
            'bancontact',
            'Bancontact',
            'https://e7.pngegg.com/pngimages/305/179/png-clipart-bancontact-mistercash-nv-payment-maestro-bank-payconiq-bank-text-logo-thumbnail.png' // Remplacez par l'URL réelle
          )}
          {renderPaymentMethod(
            'cash',
            'Cash',
            'https://cdn-icons-png.freepik.com/512/8992/8992633.png' // Remplacez par l'URL réelle
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>


        <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
          <Text style={styles.orderButtonText}>Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Simulated PayPal Payment</Text>
            <Text style={styles.modalText}>Amount: {subtotal} €</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={confirmPayment}
            >
              <Text style={styles.modalButtonText}>Confirm Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsPaymentModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  paymentContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  paymentOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  paymentOptionSelected: {
    borderColor: '#EC9D00',
  },
  paymentIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#970003',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#EC9D00',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderButton: {
    backgroundColor: '#EC9D00',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#EC9D00',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#970003',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeAllButton: {
    position: 'absolute',
    top: 20, 
    right: 20, 
    borderWidth: 1,
    borderColor: '#f6f6f6',
    borderRadius: 5,
    padding: 8,
  },
  removeAllText: {
    color: '#970003', // Texte en blanc
    fontSize: 14,
    fontWeight: 'bold',
  },  
  
});

export default Cart;
