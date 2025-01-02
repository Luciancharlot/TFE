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
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Année active
  const [beerTypes, setBeerTypes] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (filter === 'year') {
      applyFilter('year', analyticsData); // Refiltrer les données lorsque l'année change
    }
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
  }, [currentYear, filter, analyticsData]);

  const applyFilter = (selectedFilter, data = analyticsData) => {
    const now = new Date();
    let filtered = [];

    filtered = data.map((item) => {
        let total = 0;
        let totalRevenue = 0; // Calcul du gain total
        let currentPrice = 0; // Affichage du prix actuel

        if (item.dates) {
            item.dates.forEach((entry) => {
                const entryDate = new Date(entry.date);

                // Vérifier si la date correspond au filtre
                const isInFilter =
                    selectedFilter === 'today' ? isSameDay(entryDate, now) :
                    selectedFilter === 'week' ? isSameWeek(entryDate, now) :
                    selectedFilter === 'month' ? isSameMonth(entryDate, now) :
                    selectedFilter === 'quarter' ? isSameQuarter(entryDate, now) :
                    selectedFilter === 'year' ? entryDate.getFullYear() === currentYear :
                    false;

                if (isInFilter) {
                    total += entry.quantity;
                    totalRevenue += entry.quantity * entry.price;
                    currentPrice = entry.price; // Utilise le prix de la dernière entrée
                }
            });
        }

        return { ...item, total, totalRevenue, currentPrice }; // Ajout des données calculées
    });

    filtered = filtered.filter((item) => item.total > 0); // Filtrer les bières sans total
    filtered.sort((a, b) => b.total - a.total); // Trier par quantité décroissante
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
    const startOfWeek = new Date(date2);
    startOfWeek.setDate(date2.getDate() - date2.getDay() + 1); // Lundi
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
  
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
    if (newFilter !== 'year') {
      applyFilter(newFilter);
    } else {
      applyFilter(newFilter, analyticsData);
    }
  };

  const handlePreviousYear = () => {
    setCurrentYear((prevYear) => {
      const newYear = prevYear - 1;
      applyFilter('year', analyticsData); // Appliquer le filtre pour la nouvelle année
      return newYear;
    });
  };
  
  const handleNextYear = () => {
    setCurrentYear((prevYear) => {
      if (prevYear < new Date().getFullYear()) {
        const newYear = prevYear + 1;
        applyFilter('year', analyticsData); // Appliquer le filtre pour la nouvelle année
        return newYear;
      }
      return prevYear; // Ne pas dépasser l'année en cours
    });
  };
  
  const handleYearChange = (newYear) => {
    setCurrentYear(newYear);
    applyFilter('year', analyticsData); // Refiltre les données pour l'année spécifiée
  };

  const renderYearNavigation = () => (
    <View style={styles.yearNavigationContainer}>
      <TouchableOpacity style={styles.yearButton} onPress={handlePreviousYear}>
        <Text style={styles.yearButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.yearLabel}>
        {currentYear === new Date().getFullYear() ? `This Year (${currentYear})` : currentYear}
      </Text>
      <TouchableOpacity
        style={[styles.yearButton, currentYear === new Date().getFullYear() && styles.disabledButton]}
        onPress={handleNextYear}
        disabled={currentYear === new Date().getFullYear()}
      >
        <Text style={styles.yearButtonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
  const calculateTotalRevenue = () => {
    return filteredData.reduce((sum, item) => sum + (item.totalRevenue|| 0), 0);
  };
  

  const renderItem = ({ item }) => {
    // Définit des valeurs par défaut pour éviter les erreurs
    const currentPrice = item.currentPrice || 0; // Si le prix actuel n'est pas défini, utilise 0
    const totalRevenue = item.totalRevenue || 0; // Si le gain total n'est pas défini, utilise 0
    const totalQuantity = item.total || 0; // Renomme `quantity` en `totalQuantity` pour éviter les conflits
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
          <Text style={styles.itemDetails}>Quantity Sold: {totalQuantity}</Text>
          <Text style={styles.itemDetails}>Current Price: {currentPrice.toFixed(2)} €</Text>
          <Text style={styles.itemDetails}>Total Revenue: {totalRevenue.toFixed(2)} €</Text>
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
  
      {/* Year Navigation */}
      {filter === 'year' && renderYearNavigation()}
  
      {/* Total Revenue */}
      <View style={styles.totalRevenueContainer}>
        <Text style={styles.totalRevenueText}>
          Total Revenue: {calculateTotalRevenue().toFixed(2)} €
        </Text>
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
  yearNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  yearButton: {
    backgroundColor: '#EC9D00',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  yearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRevenueContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  totalRevenueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
  },
});

export default ProAnalytics;
