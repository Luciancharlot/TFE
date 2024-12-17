import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';

const ProAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState('today');
  const [beerTypes, setBeerTypes] = useState({});

  useEffect(() => {
    // Fetch beer types
    const typesRef = ref(database, 'beer_types');
    const unsubscribeTypes = onValue(typesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setBeerTypes(data);
    });

    // Fetch analytics data
    const analyticsRef = ref(database, 'analytics');
    const unsubscribeAnalytics = onValue(analyticsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({
          beer_name: key,
          ...data[key],
        }));
        setAnalyticsData(items);
        applyFilter(filter, items);
      } else {
        setAnalyticsData([]);
        setFilteredData([]);
      }
    });

    return () => {
      unsubscribeTypes();
      unsubscribeAnalytics();
    };
  }, []);

  const applyFilter = (selectedFilter, data = analyticsData) => {
    const now = new Date();
    let filtered = [];

    switch (selectedFilter) {
      case 'today':
        filtered = data.filter((item) =>
          item.dates?.some((date) => isSameDay(new Date(date), now))
        );
        break;
      case 'week':
        filtered = data.filter((item) =>
          item.dates?.some((date) => isSameWeek(new Date(date), now))
        );
        break;
      case 'quarter':
        filtered = data.filter((item) =>
          item.dates?.some((date) => isSameQuarter(new Date(date), now))
        );
        break;
      case 'year':
        filtered = data.filter((item) =>
          item.dates?.some((date) => isSameYear(new Date(date), now))
        );
        break;
      default:
        filtered = data;
    }

    filtered.sort((a, b) => b.quantity - a.quantity); // Trier par quantité décroissante
    setFilteredData(filtered);
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isSameWeek = (date1, date2) => {
    const startOfWeek = new Date(
      date2.setDate(date2.getDate() - (date2.getDay() || 7) + 1) // Commence le lundi
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return date1 >= startOfWeek && date1 <= endOfWeek;
  };

  const isSameMonth = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
    );
  };

  const isSameQuarter = (date1, date2) => {
    const quarter1 = Math.floor(date1.getMonth() / 3);
    const quarter2 = Math.floor(date2.getMonth() / 3);
    return date1.getFullYear() === date2.getFullYear() && quarter1 === quarter2;
  };

  const isSameYear = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilter(newFilter);
  };

  const renderItem = ({ item }) => {
    // Fonction pour récupérer les noms de type en cas de types multiples
    const getTypeNames = (typeIds) => {
      if (!typeIds) return 'Unknown';
      const ids = typeIds.split(','); // Séparer les ID multiples
      return ids
        .map((id) => beerTypes[id]?.type_name || 'Unknown') // Mapper chaque type
        .join(', '); // Joindre avec une virgule
    };
  
    const typeName = getTypeNames(item.type_name); // Mettre à jour avec la nouvelle fonction
    const quantity = item.quantity || 0;
  
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemName}>{item.beer_name}</Text>
        <Text style={styles.itemDetails}>Type: {typeName}</Text>
        <Text style={styles.itemDetails}>Quantity Sold: {quantity}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'today' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('today')}
        >
          <Text style={styles.filterButtonText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'week' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('week')}
        >
          <Text style={styles.filterButtonText}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'month' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('month')}
        >
          <Text style={styles.filterButtonText}>This Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'quarter' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('quarter')}
        >
          <Text style={styles.filterButtonText}>This Quarter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'year' && styles.filterButtonActive]}
          onPress={() => handleFilterChange('year')}
        >
          <Text style={styles.filterButtonText}>This Year</Text>
        </TouchableOpacity>
      </View>

      {/* List of Analytics */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.beer_name}
        renderItem={renderItem}
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
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#EC9D00',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 16,
  },
  itemContainer: {
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
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 14,
    color: '#555',
  },
});

export default ProAnalytics;
