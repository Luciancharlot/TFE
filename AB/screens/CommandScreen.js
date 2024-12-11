import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const CommandScreen = () => {
    const [beers, setBeers] = useState([]);

    useEffect(() => {
        fetch('http://192.168.1.13:5000/api/beers')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setBeers(data);
            })
            .catch(error => console.error('Error fetching beer data:', error));
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.beerName}>{item.beer_name}</Text>
            <Text>ABV: {item.abv}%</Text>
            <Text>Description: {item.description}</Text>
        </View>
    );

    return (
        <FlatList
            data={beers}
            keyExtractor={(item) => item.beer_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    itemContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    beerName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CommandScreen;
