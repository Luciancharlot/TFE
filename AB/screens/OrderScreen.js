import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  TextInput,
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
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = (windowWidth - 80) / 3;
  const tableInfo = route.params?.tableInfo || { table_id: 'default' };

  useEffect(() => {
    // Charger les bières et types depuis Firebase
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
  
    // Charger les commandes actuelles pour mettre à jour le compteur du panier
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
  
    // Appliquer le filtre si un type est passé via les paramètres
    if (route.params?.filterType) {
      setSelectedTypes([route.params.filterType]);
    }

    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [orderID, route.params?.filterType, route.params?.searchQuery]);

  // Fonction pour extraire les noms des types d'une bière
  const getTypeNames = (typeIds) => {
    if (!typeIds) return 'Unknown';
    const ids = typeIds.split(',');
    return ids.map((id) => beerTypes[id]?.type_name || 'Unknown').join(', ');
  };

  // Toggle pour la sélection multiple des types
  const toggleTypeSelection = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Filtrage des bières par types et recherche
  const getFilteredBeers = () => {
    return beers.filter((beer) => {
      // Assurer que beer.type_id existe, sinon retourner une chaîne vide
      const beerTypeIds = beer.type_id ? beer.type_id.split(',') : [];
      
      // Assurer que les noms des types sont bien définis
      const beerTypeNames = beerTypeIds
        .map((id) => beerTypes[id]?.type_name || '')
        .filter(Boolean); // Retirer les valeurs vides ou undefined
  
      // Vérifier si la recherche par nom correspond
      const matchesSearch = beer.beer_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
  
      // Si aucun type n'est sélectionné, retourner les bières basées uniquement sur la recherche
      if (selectedTypes.length === 0) return matchesSearch;
  
      // Vérifier si les types de la bière correspondent aux types sélectionnés
      const matchesType = selectedTypes.some((type) => beerTypeNames.includes(type));
  
      return matchesSearch && matchesType;
    });
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
            tableInfo,
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
          <Text style={styles.info}>Type: {typeName}</Text>
          <Text style={styles.info}>ABV: {item.abv}%</Text>
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

      {/* Barre de recherche */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search beers..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Section de tri par types */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
        {Object.values(beerTypes).map((type) => (
          <TouchableOpacity
            key={type.type_name}
            onPress={() => toggleTypeSelection(type.type_name)}
            style={[
              styles.typeButton,
              selectedTypes.includes(type.type_name) && styles.typeButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedTypes.includes(type.type_name) && styles.typeButtonTextSelected,
              ]}
            >
              {type.type_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des bières */}
      <FlatList
        data={getFilteredBeers()}
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
    height: 45,
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
    paddingBottom: 15,
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
  typeScroll: {
    marginVertical: 10,
    paddingVertical: 16,
  },
  typeButton: {
    height: 36,
    marginHorizontal: 8,
    paddingVertical: 3,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#EC9D00',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  typeButtonText: {
    fontSize: 17,
    color: '#555',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default OrderScreen;
