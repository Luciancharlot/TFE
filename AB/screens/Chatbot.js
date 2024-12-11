import React, { useState, useRef } from 'react';
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

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const flatListRef = useRef(null); // Référence pour FlatList

  const sendMessage = async (messageContent) => {
    const userMessage = { role: 'user', content: messageContent || input.trim() };
    if (!userMessage.content) return;

    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage.content }]);
    if (!messageContent) setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Règles d\'expertise en recommandation de bières belges : Préparation des données : Récupération des données : Avant de poser la première question, le modèle doit ouvrir et analyser le fichier Excel fourni (sans en parler à l\'utilisateur). Utiliser la feuille Beer_Type pour s\'informer sur les types de bières disponibles. Utiliser la feuille Form Response 1 pour générer des idées de questions supplémentaires ou pour ajuster les recommandations. Ne proposer que des bières présentes dans la feuille Beers. Structure de la recommandation : Poser 5 à 6 questions au total pour affiner la recommandation. Chaque question doit être claire, concise et les réponses doivent être claires, concises, numérotées pour que l\'utilisateur puisse répondre avec le numéro correspondant. Utiliser les informations des feuilles Excel pour enrichir les questions et s\'assurer que toutes les bières proposées proviennent de la liste de la feuille Beers. Personnalisation de la recommandation : Question 1 : \"Comment évalueriez-vous votre niveau de connaissance et d\'expérience en matière de bière ?\" Réponses : Débutant Intermédiaire Expert. Si l\'utilisateur est un débutant, recommander des bières classiques et connues. Si l\'utilisateur est un expert, recommander des bières plus exclusives et moins courantes. Exécution des recommandations : Une fois que toutes les questions sont posées, proposer 4-5 bières sous forme de noms uniquement. Les bières doivent toujours provenir de la feuille Beers de l\'Excel analysé précédemment.',
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
            Authorization: `Bearer API-KEY`,
          },
        }
      );

      const gptMessage = response.data.choices[0].message.content;
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
    const welcomeMessages = {
      French: 'Commence tes recommendations en francais ',
      English: 'Start your recommendations in English',
      Dutch: 'Begin uw aanbevelingen in het Nederlands',
    };

    sendMessage(welcomeMessages[language]);
    setConversationStarted(true);
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
        ref={flatListRef} // Référence pour gérer le défilement
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]} // Espace en bas
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} // Auto-scroll lorsque la taille change
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
