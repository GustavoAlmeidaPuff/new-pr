import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBS-UxGjKMGGg_4mjttKewyU6jvmAOf42k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "new-pr-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "new-pr-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "new-pr-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "305812612220",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:305812612220:web:77963486a4b5402d8215f9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5T0V79PNM5",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Falha ao configurar persistência do Firebase Auth", error);
});

const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, firestore, googleProvider };
