import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const OrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderID } = route.params;
  const [beers, setBeers] = useState([]);
  const [beerTypes, setBeerTypes] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = (windowWidth - 80) / 3;
  const tableInfo = route.params?.tableInfo || { table_id: 'default'}; 

  useEffect(() => {
    const beersRef = ref(database, 'beers');
    onValue(beersRef, (snapshot) => {
      const data = snapshot.val();
      const beersList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setBeers(beersList);
    });

    const typesRef = ref(database, 'beer_types');
    onValue(typesRef, (snapshot) => {
      const data = snapshot.val();
      setBeerTypes(data);
    });

    const ordersRef = ref(database, `orders/${tableInfo.table_id}/${orderID}`);
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const totalQuantity = Object.values(data).reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        setCartCount(totalQuantity);
      } else {
        setCartCount(0);
      }
    });
  }, [orderID]);

  const getTypeNames = (typeIds) => {
    if (!typeIds) return 'Surprise';
    const ids = typeIds.split(',');
    return ids.map((id) => beerTypes[id]?.type_name || 'Surprise').join(', ');
  };

  const renderItem = ({ item }) => {
    const typeName = getTypeNames(item.type_id);

    return (
      <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() =>
        navigation.navigate('BeerDetails', { 
          beer: item, 
          orderID, 
          tableInfo // Passe tableInfo ici
        })
      }
    >
        <Image
          source={{ uri: item.image }}
          style={[styles.image, { width: cardWidth - 16, height: cardWidth - 125 }]}
          resizeMode="contain"
        />
        <View style={styles.details}>
          <Text style={styles.name}>{item.beer_name}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.info}>Type: {typeName}</Text>
            <Text style={styles.info}>ABV: {item.abv}%</Text>
          </View>
          <Text style={styles.price}>
            <Text style={styles.priceValue}>{item.beer_price || 0}</Text> €
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Beers</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', { orderID, tableInfo })}
        >
          <Image
            source={require('../assets/cart-icon.png')}
            style={styles.chatIcon}
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <FlatList
        data={beers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        numColumns={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cartButton: {
    position: 'absolute',
    right: 270,
    top: 0,
    backgroundColor: '#EC9D00',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  chatIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    borderRadius: 8,
    marginBottom: 8,
  },
  details: {
    flex: 1,
    marginTop: 8,
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  info: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  priceValue: {
    fontSize: 14,
    color: '#EC9D00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default OrderScreen;
