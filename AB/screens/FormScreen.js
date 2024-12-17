import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const FormScreen = () => {
  const [beerPreference, setBeerPreference] = useState('');
  
  const handleSubmit = () => {
    alert(`Form submitted with beer preference: ${beerPreference}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beer Preference Form</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your favorite beer"
        value={beerPreference}
        onChangeText={setBeerPreference}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default FormScreen;
