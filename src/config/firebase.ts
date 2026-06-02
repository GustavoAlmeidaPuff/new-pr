import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

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

// Inicializa o Firebase (duas instâncias para manter duas contas logadas no mesmo aparelho)
const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, "account-secondary");

const primaryAuth = getAuth(app);
const secondaryAuth = getAuth(secondaryApp);

for (const authInstance of [primaryAuth, secondaryAuth]) {
  setPersistence(authInstance, browserLocalPersistence).catch((error) => {
    console.error("Falha ao configurar persistência do Firebase Auth", error);
  });
}

const firestore = getFirestore(app);
// Especifica a região das Functions (us-central1 é o padrão)
const functions = getFunctions(app, "us-central1");
const googleProvider = new GoogleAuthProvider();

// Conecta ao emulador local se estiver em desenvolvimento
if (import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export { app, secondaryApp, primaryAuth, secondaryAuth, firestore, functions, googleProvider };
