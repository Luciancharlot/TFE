import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios'; 
import BackButton from '../components/BackButton';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';


const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const flatListRef = useRef(null); 

  // Charger et analyser le fichier JSON
  useEffect(() => {
    console.log("Chatbot component initialized");
    const loadJsonData = () => {
      try {
        const data = require('../assets/Responses_TFE.json');
        console.log("JSON data loaded"); // Nouveau log
        if (!data || !data.Beers || !data.Beer_Type) {
          throw new Error('Les données JSON sont incomplètes ou mal formatées.');
        }
        setJsonData(data);
      } catch (error) {
        console.error('Erreur lors du chargement du fichier JSON :', error);
      }
    };
  
    loadJsonData();
  }, []);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const snapshot = await get(ref(database, '/api_keys/openai_key'));
        if (snapshot.exists()) {
          const apiKey = snapshot.val();
          console.log('Clé OpenAI récupérée :', apiKey);
          setOpenAiApiKey(apiKey); // Stocke la clé dans l'état
        } else {
          console.error('Clé OpenAI non trouvée.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la clé OpenAI :', error);
      }
    };
  
    fetchApiKey();
  }, []);
  
  useEffect(() => {
    fetch('https://api.openai.com')
        .then(() => console.log("API OpenAI accessible"))
        .catch((error) => console.error("API OpenAI inaccessible:", error));
  }, []);

  const sendMessage = async (messageContent) => {
    const userMessage = { role: 'user', content: messageContent || input.trim() };
    console.log("User message to send:", userMessage); // Nouveau log
  
    if (!userMessage.content) return;
  
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage.content }]);
    console.log("Messages after adding user message:", messages); // Nouveau log
    if (!messageContent) setInput('');
    setLoading(true);
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            // Messages envoyés
            {
              role: 'system',
              content: `
                  Règles d'expertise en recommandation de bières belges :
                  Récupération des données : Avant de poser la première question, le modèle doit analyser les données JSON fournies (Beer_Type, Form Response 1, et Beers). 
                  - Utiliser les données de "Beer_Type" pour s'informer sur les types de bières disponibles.
                  - Utiliser "Form Response 1" pour générer des idées de questions supplémentaires ou ajuster les recommandations.
                  - Ne proposer que des bières présentes dans "Beers".
                  
                  Structure de la recommandation :

                  Poser 6 à 7 questions au total pour affiner la recommandation.
                  Chaque question doit être claire, concise et les réponses doivent être claire, concise, numérotées avec minimum 3 réponses pour que l'utilisateur puisse répondre avec le numéro correspondant.
                  Utiliser les informations de "Form Responses 1" du fichier JSON pour enrichir les questions et s'assurer que toutes les bières proposées proviennent de la liste "Beers" du fichier JSON.

                  Personnalisation de la recommandation :

                  Question 1 : "Comment évalueriez-vous votre niveau de connaissance et d'expérience en matière de bière ?"
                  Réponses :
                  Débutant
                  Intermédiaire
                  Expert
                  Si l'utilisateur est un débutant, recommander des bières classiques et connues.
                  Si l'utilisateur est un intermédiaire, recommander des bières classiques et plus exclusive
                  Si l'utilisateur est un expert, recommander des bières très exclusives et peu courantes.
                  
                  Exécution des recommandations :

                  Une fois que toutes les questions sont posées, proposer 4-5 bières sous forme de noms uniquement en analysant toute les réponses.
                  Si le client indique le numéro d’une des bières proposées, il faut lui expliquer plus précisément les caractéristiques de la bière.
                  Les bières doivent toujours provenir de la feuille Beers du fichier JSON analysé précédemment.
                  Lors de la recommandation d'une bière, utiliser l'API de Ratebeer pour vérifier si la bière est bien notée et obtenir des informations supplémentaires sur celle-ci.
                  Lien pour les avis : https://www.ratebeer.com/beer-ratings/
                `,
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
            Authorization: `Bearer ${openAiApiKey}`,
          },
        }
      );
  
      const gptMessage = response.data.choices[0].message.content;
      console.log("GPT response received:", gptMessage); // Nouveau log
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: gptMessage }]);
  
      // Défilement automatique après avoir ajouté la réponse
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Erreur avec l\'API GPT :', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Une erreur est survenue. Veuillez réessayer.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = (language) => {
    console.log("Starting conversation in:", language); // Nouveau log
    const welcomeMessages = {
      French: 'Commence tes recommendations en francais ',
      English: 'Start your recommendations in English',
      Dutch: 'Begin uw aanbevelingen in het Nederlands',
    };
  
    sendMessage(welcomeMessages[language]);
    setConversationStarted(true);
  };

  const newChat = () => {
    setMessages([]);
    setConversationStarted(false);
    setInput('');
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10} // Espace supplémentaire pour iOS
    >
      <BackButton />
      <TouchableOpacity style={styles.newChatButton} onPress={newChat}>
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

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

      <FlatList
        ref={flatListRef} 
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]} 
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} 
      />

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  newChatButton: {
    backgroundColor: '#EC9D00',
    padding: 10,
    margin: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  newChatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
  },
  languageButton: {
    backgroundColor: '#FAE96F',
    padding: 10,
    borderRadius: 5,
    margin: 15,
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
});

export default Chatbot;
