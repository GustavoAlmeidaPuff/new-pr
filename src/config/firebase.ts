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

// Cada Firebase App tem seu próprio Auth — e o Firestore precisa ser criado a partir do app
// correspondente pra que o token de autenticação certo seja enviado em cada request.
// Caso contrário, o usuário logado no slot secundário não é reconhecido pelo Firestore.
const firestore = getFirestore(app);
const secondaryFirestore = getFirestore(secondaryApp);

// Especifica a região das Functions (us-central1 é o padrão)
const functions = getFunctions(app, "us-central1");
const googleProvider = new GoogleAuthProvider();

// Conecta ao emulador local se estiver em desenvolvimento
if (import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

const ACTIVE_SLOT_KEY = "newpr:active-account-slot";

export type FirestoreSlot = 0 | 1;

export function getFirestoreForSlot(slot: FirestoreSlot) {
  return slot === 0 ? firestore : secondaryFirestore;
}

/**
 * Retorna o Firestore amarrado ao slot ativo (lido do localStorage).
 * Use isso em vez de importar `firestore` direto, para que o token do usuário ativo
 * seja enviado ao Firestore.
 */
export function getActiveFirestore() {
  if (typeof window === "undefined") return firestore;
  return localStorage.getItem(ACTIVE_SLOT_KEY) === "1" ? secondaryFirestore : firestore;
}

export {
  app,
  secondaryApp,
  primaryAuth,
  secondaryAuth,
  firestore,
  secondaryFirestore,
  functions,
  googleProvider,
};
