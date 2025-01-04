import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BackButton = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn("No screen to go back to.");
    }
  };

  return (
    <TouchableOpacity style={styles.touchableArea} onPress={handleGoBack}>
      <Icon name="arrow-back" size={28} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableArea: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 20, // Augmente la zone cliquable autour de la flèche
  },
});

export default BackButton;
