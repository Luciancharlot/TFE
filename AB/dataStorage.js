import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveOrderOffline = async (order) => {
  try {
    const orders = JSON.parse(await AsyncStorage.getItem('orders')) || [];
    orders.push(order);
    await AsyncStorage.setItem('orders', JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving order offline:', error);
  }
};

export const getOfflineOrders = async () => {
  try {
    return JSON.parse(await AsyncStorage.getItem('orders')) || [];
  } catch (error) {
    console.error('Error fetching offline orders:', error);
    return [];
  }
};

export const clearOfflineOrders = async () => {
  try {
    await AsyncStorage.removeItem('orders');
  } catch (error) {
    console.error('Error clearing offline orders:', error);
  }
};

export const saveDataOffline = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} offline:`, error);
  }
};

export const getDataOffline = async (key) => {
  try {
    return JSON.parse(await AsyncStorage.getItem(key)) || [];
  } catch (error) {
    console.error(`Error fetching ${key} offline:`, error);
    return [];
  }
};

export const clearDataOffline = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing ${key} offline:`, error);
  }
};