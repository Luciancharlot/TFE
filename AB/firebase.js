import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth'; // Importer le module d'authentification

const firebaseConfig = {
  apiKey: "AIzaSyD8tHB2HoqcgQbSThoa4SAqCOHGvrhP6u0",
  authDomain: "tfe-ba.firebaseapp.com",
  databaseURL: "https://tfe-ba-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tfe-ba",
  storageBucket: "tfe-ba.firebasestorage.app",
  messagingSenderId: "289330666739",
  appId: "1:289330666739:web:1eee6f3c2fb87e968b6b86",
  measurementId: "G-Z4K10XN46B"
};

let app;

// Vérifiez si une instance Firebase existe déjà
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialiser la base de données et l'authentification
const database = getDatabase(app);
const auth = getAuth(app); // Initialiser Auth

export { database, auth };
