import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]); // Liste des messages
  const [input, setInput] = useState(''); // Texte entré par l'utilisateur
  const [loading, setLoading] = useState(false); // Indique si une requête est en cours
  const [conversationStarted, setConversationStarted] = useState(false); // Indique si la conversation a commencé

  // Fonction pour envoyer un message à GPT
  const sendMessage = async (messageContent) => {
    const userMessage = { role: 'user', content: messageContent || input.trim() };
    if (!userMessage.content) return; // Ne pas envoyer de message vide

    // Ajouter le message de l'utilisateur à la liste des messages
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage.content }]);
    if (!messageContent) setInput(''); // Réinitialiser l'input si le message n'est pas initial
    setLoading(true); // Indiquer qu'une requête est en cours

    try {
      // Faire une requête à l'API OpenAI
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Remplacez par l'ID de votre modèle personnalisé
          messages: [
            {
              role: 'system',
              content:
                'Tu es un expert en recommandation de bières belges. Règles d\'expertise : Préparation des données : Avant de poser la première question, le modèle doit ouvrir et analyser le fichier Excel fourni(sans en parler à l\'utilisateur).Utiliser la feuille Beer_Type pour s\'informer sur les types de bières disponibles.Utiliser la feuille Form Response 1 pour générer des idées de questions supplémentaires ou pour ajuster les recommandations.Ne proposer que des bières présentes dans la feuille Beers. Poser 5 à 6 questions au total pour affiner la recommandation.Chaque question doit être claire, concise et les réponses doivent être claire, concise, numérotées pour que l\'utilisateur puisse répondre avec le numéro correspondant.Utiliser les informations des feuilles Excel pour enrichir les questions et s\'assurer que toutes les bières proposées proviennent de la liste de la feuille Beers.Une fois que toutes les questions sont posées, proposer 4-5 bières sous forme de noms uniquement.Les bières doivent toujours provenir de la feuille Beers de l\'Excel analysé précédemment.',
            },
            ...messages.map((msg) => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            userMessage,
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer`, // Remplacez par votre clé API
          },
        }
      );

      // Ajouter la réponse de GPT aux messages
      const gptMessage = response.data.choices[0].message.content;
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: gptMessage }]);
    } catch (error) {
      console.error('Erreur avec l\'API GPT :', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Une erreur est survenue. Veuillez réessayer.' },
      ]);
    } finally {
      setLoading(false); // Indiquer que la requête est terminée
    }
  };

  // Fonction pour démarrer une conversation
  const startConversation = (language) => {
    const welcomeMessages = {
        French: 'Commence tes recommendations en francais ',
        English: 'Start your recommendations in English',
        Dutch: 'Begin uw aanbevelingen in het Nederlands',
    };

    // Envoyer le message de démarrage au bot
    sendMessage(welcomeMessages[language]);
    setConversationStarted(true); // Masquer les boutons une fois la conversation commencée
  };

  // Fonction pour afficher chaque message
  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Boutons pour choisir la langue (uniquement au démarrage) */}
      {!conversationStarted && (
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => startConversation('French')}
          >
            <Text style={styles.languageText}>Pour commencer, cliquez ici.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => startConversation('English')}
          >
            <Text style={styles.languageText}>To begin, click here.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => startConversation('Dutch')}
          >
            <Text style={styles.languageText}>Om te beginnen, klik hier.</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messageList}
      />

      {/* Input pour écrire un message */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
  },
  languageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 10,
  },
  languageText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  messageList: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DF8D03',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F6C101',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#EC9D00',
    borderRadius: 20,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageContainer: {
    flex: 1, // Prend tout l'espace disponible
    flexDirection: 'row', // Place les boutons horizontalement
    justifyContent: 'center', // Centre les boutons horizontalement
    alignItems: 'center', // Centre les boutons verticalement
  },
  languageButton: {
    backgroundColor: '#FAE96F', // Couleur orange
    padding: 10, // Espace intérieur du bouton
    borderRadius: 5, // Coins arrondis
    margin: 15, // Marge entre les boutons
  },
});

export default Chatbot;
