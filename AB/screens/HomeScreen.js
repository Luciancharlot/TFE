import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,ImageBackground,Image } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const openChatbot = () => {
    // Remplacez cette fonction par l'action qui ouvre votre chatbot
    console.log('Chatbot ouvert');
    navigation.navigate('Chatbot'); // Navigation vers une page "Chatbot" si elle existe
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your beer recommender</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Command')}
      >
        <Text style={styles.buttonText}>Order Beer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Analytics')}
      >
        <Text style={styles.buttonText}>Analytics</Text>
      </TouchableOpacity>

      {/*<TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Form')}
      >
        <Text style={styles.buttonText}>Fill Form</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Command')}
      >
        <ImageBackground
          source={require('../assets/beer.jpg')} // Image de fond
          style={styles.button}
          imageStyle={{ borderRadius: 10 }} // Pour arrondir les coins de l'image
        >
          <Text style={styles.buttonText}>Order Beer</Text>
        </ImageBackground>
      </TouchableOpacity>*/}

      {/* Bouton chatbot */}
      <TouchableOpacity style={styles.floatingButton} onPress={openChatbot/*() => navigation.navigate('Analytics')*/}>
        <Image
          source={require('../assets/chat-icon.png')} // Remplacez par votre icône
          style={styles.chatIcon}
        />
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40, // Plus d'espace sous le titre
    color: '#333', // Couleur du texte du titre
  },
  button: {
    backgroundColor: '#8FC0A9',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10, // Espace entre les boutons
    alignItems: 'center',
    width: '80%', // Largeur des boutons
  },
  buttonText: {
    color: '#fff', // Couleur du texte des boutons
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  chatIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff', // Couleur blanche pour l'icône
  },
});

export default HomeScreen;