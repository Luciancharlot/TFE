import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useNavigation } from '@react-navigation/native';
import { ref, push, update, get } from 'firebase/database';
import { database } from '../firebase';

NfcManager.start();

const HomeScreen = () => {
  const navigation = useNavigation();
  const [beerOfTheMoment, setBeerOfTheMoment] = useState(null);
  const [beerImage, setBeerImage] = useState(null);
  const [beerTypes, setBeerTypes] = useState([]);
  const [typeOfTheMoment, setTypeOfTheMoment] = useState(null);
  const [tableInfo, setTableInfo] = useState({ table_id: null });
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualTableId, setManualTableId] = useState('');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const analyticsRef = ref(database, 'analytics');
        const beersRef = ref(database, 'beers');
        const typesRef = ref(database, 'beer_types');
  
        const analyticsSnapshot = await get(analyticsRef);
        const typesSnapshot = await get(typesRef);
        const beersSnapshot = await get(beersRef);
  
        const analyticsData = analyticsSnapshot.val();
        const typesData = typesSnapshot.val();
        const beersData = beersSnapshot.val();
  
        if (analyticsData) {
          let beerQuantities = {};
          let typeQuantities = {};
  
          // Parcours des bières et calcul des quantités
          Object.keys(analyticsData).forEach((beerName) => {
            const beerData = analyticsData[beerName];
            const quantity = beerData.quantity || 0;
            const typeIds = beerData.type_name?.split(',') || []; // IDs des types multiples
  
            // Quantité par bière
            beerQuantities[beerName] = (beerQuantities[beerName] || 0) + quantity;
  
            // Quantité par type (traduire ID en nom)
            typeIds.forEach((typeId) => {
              const cleanTypeId = typeId.trim();
              const typeName = typesData[cleanTypeId]?.type_name || 'Unknown';
              if (typeName) {
                typeQuantities[typeName] = (typeQuantities[typeName] || 0) + quantity;
              }
            });
          });
  
          const maxQuantity = Math.max(...Object.values(beerQuantities));

      // Récupérer toutes les bières ayant la quantité maximale
          const mostSoldBeers = Object.keys(beerQuantities).filter(
            (beerName) => beerQuantities[beerName] === maxQuantity
          );

          // Récupérer les détails des bières
          const beerDetails = mostSoldBeers.map((beerName) => ({
            name: beerName,
            image: Object.values(beersData).find((beer) => beer.beer_name === beerName)?.image || null,
          }));

          setBeerOfTheMoment(beerDetails);
          setBeerImage(beerDetails?.image || null);
  
          // Type(s) le(s) plus vendu(s) avec le nom
          const mostSoldType = Object.keys(typeQuantities).reduce((a, b) =>
            typeQuantities[a] > typeQuantities[b] ? a : b
          );
          setTypeOfTheMoment(mostSoldType);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };
  
    fetchAnalyticsData();
    const intervalId = setInterval(fetchAnalyticsData, 1800000);
  
    return () => clearInterval(intervalId);
  }, []);

  const handleNfcScan = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      const payload = tag?.ndefMessage?.[0]?.payload;

      if (payload) {
        const jsonString = String.fromCharCode(...payload).trim().replace(/^\x02en/, '');
        const tableData = JSON.parse(jsonString);

        if (tableData.table_id) {
          setTableInfo({ table_id: tableData.table_id });
        }
      }
    } catch (ex) {
      Alert.alert('Error', 'Failed to scan NFC.');
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  const handleStartOrder = () => {
    if (!tableInfo.table_id) {
      Alert.alert(
        'Error',
        'Please scan the table NFC tag first!',
        [
          { text: "I don't have NFC", onPress: () => setManualModalVisible(true) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return;
    }
    createOrder(tableInfo.table_id, 'orderBeer');
  };

  const isValidTableId = (input) => {
    // Vérifie si l'entrée est un entier positif ou zéro
    const parsedNumber = parseInt(input, 10);
    return !isNaN(parsedNumber) && parsedNumber >= 0 && input === parsedNumber.toString();
  };
  
  const handleManualSubmit = () => {
    if (isValidTableId(manualTableId)) {
      setTableInfo({ table_id: manualTableId });
      setManualModalVisible(false);
      createOrder(manualTableId, 'orderBeer');
    } else {
      Alert.alert('Error', 'Please enter a valid table number (integer >= 0).');
    }
  };

  const handleTypeOfTheMoment = () => {
    if (!tableInfo.table_id) {
      Alert.alert(
        'Error',
        'Please scan the table NFC tag first!',
        [
          { text: "I don't have NFC", onPress: () => setManualModalVisible(true) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return;
    }
  
    createOrder(tableInfo.table_id, 'typeOfTheMoment', { filterType: typeOfTheMoment });
  };

  const handleBeerOfTheMomentClick = (beer) => {
    if (!tableInfo.table_id) {
      Alert.alert(
        'Error',
        'Please scan the table NFC tag first!',
        [
          { text: "I don't have NFC", onPress: () => setManualModalVisible(true) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return;
    }
  
    createOrder(tableInfo.table_id, 'beerOfTheMoment', { searchQuery: beer.name });
  };

const createOrder = async (tableId, actionType, options = {}) => {
  try {
    const newOrderRef = push(ref(database, `orders/${tableId}`));
    const orderID = newOrderRef.key;

    await update(ref(database, `orders/${tableId}/${orderID}`), {
      initialized: true,
    });

    // Distinction selon le type d'action
    if (actionType === 'orderBeer') {
      navigation.navigate('Order', { orderID, tableInfo: { table_id: tableId } });
    } else if (actionType === 'beerOfTheMoment') {
      navigation.navigate('Order', {
        orderID, // Ajoute l'orderID ici
        tableInfo: { table_id: tableId },
        searchQuery: options.searchQuery, // Passe le nom de la bière comme recherche
      });
    } else if (actionType === 'typeOfTheMoment') {
      navigation.navigate('Order', {
        orderID, // Ajoute l'orderID ici
        tableInfo: { table_id: tableId },
        filterType: options.filterType, // Passe le type du moment comme filtre
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
  }
};


  const openChatbot = () => navigation.navigate('Chatbot');
  const handleLogin = () => navigation.navigate('Login');

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/*<Text style={styles.title}>Welcome to your beer recommender</Text>*/}

      {/* NFC Scan */}
      <TouchableOpacity style={styles.button} onPress={handleNfcScan}>
        <Text style={styles.buttonText}>Scan NFC for Table</Text>
      </TouchableOpacity>

      {tableInfo.table_id && (
        <Text style={styles.tableInfo}>Table: {tableInfo.table_id}</Text>
      )}

      {/* Start Order */}
      <TouchableOpacity style={styles.button} onPress={handleStartOrder}>
        <Text style={styles.buttonText}>Order Beer</Text>
      </TouchableOpacity>

      {/* Modal pour saisie manuelle */}
      <Modal visible={manualModalVisible} animationType="fade" transparent>
        <View style={styles.alertContainer}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Enter Table Number</Text>
            <TextInput
              style={styles.alertInput}
              placeholder="Table Number"
              keyboardType="numeric"
              onChangeText={(text) => {
                if (isValidTableId(text) || text === '') {
                  setManualTableId(text);
                } else {
                  Alert.alert('Invalid Input', 'Please enter a valid table number (integer >= 0).');
                }
              }}
              value={manualTableId}
            />
            <View style={styles.alertButtons}>
              <TouchableOpacity onPress={() => setManualModalVisible(false)} style={styles.alertButton}>
                <Text style={styles.alertButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleManualSubmit} style={styles.alertButton}>
                <Text style={styles.alertButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {beerOfTheMoment && beerOfTheMoment.length > 0 && (
        <View style={styles.momentContainer}>
          <Text style={styles.momentTitle}>🍺 Beer of the Moment</Text>
          <View style={styles.beerMomentRow}>
            {beerOfTheMoment.map((beer, index) => (
              <TouchableOpacity
                key={index}
                style={styles.beerMomentItem}
                onPress={() => handleBeerOfTheMomentClick(beer)}
              >
                {beer.image && <Image source={{ uri: beer.image }} style={styles.beerImage} />}
                <Text style={styles.momentHighlight}>{beer.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Type of the Moment */}
      {typeOfTheMoment && (
        <TouchableOpacity style={styles.momentContainer} onPress={handleTypeOfTheMoment}>
          <Text style={styles.momentTitle}>🌟 Type of the Moment</Text>
          <Text style={styles.momentHighlight}>{typeOfTheMoment}</Text>
        </TouchableOpacity>
      )}

      {/* Chatbot Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={openChatbot}>
        <Image source={require('../assets/chat-icon.png')} style={styles.chatIcon} />
      </TouchableOpacity>

      {/* Professional Login */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Professional Login</Text>
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
  momentContainer: {
    marginTop: 20,
    backgroundColor: '#FFF0C2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
    elevation: 4,
  },
  momentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D35400',
  },
  momentHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  beerMomentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap', // Permet d'aller à la ligne si trop de bières
  },
  beerMomentItem: {
    alignItems: 'center',
    marginHorizontal: 10, // Espacement horizontal entre les bières
    marginBottom: 10, // Espacement si elles doivent passer à la ligne
  },
  beerImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#8FC0A9',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    padding: 8,
  },
  loginText: {
    color: '#8FC0A9',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fond semi-transparent
  },
  alertBox: {
    width: '25%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Ombre Android
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  alertButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#8FC0A9',
    borderRadius: 5,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default HomeScreen;
