import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { getDocumentData } from "../cache/firestoreCache";
import { auth, firestore, googleProvider } from "../config/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Primeiro, verifica se há um redirect result pendente
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && mounted) {
          // Login bem-sucedido via redirect, o onAuthStateChanged vai detectar
          console.log("Login via redirect bem-sucedido");
        }
      } catch (error) {
        console.error("Erro no redirect:", error);
      }
    };

    checkRedirectResult();

    // Depois, escuta mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;

      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const userRef = doc(firestore, "users", currentUser.uid);
        const userData = await getDocumentData<Record<string, unknown> | null>(
          `users:${currentUser.uid}`,
          {
            refFactory: () => userRef,
            map: (snapshot) => {
              if (!snapshot || !snapshot.exists()) {
                return null;
              }
              return snapshot.data() as Record<string, unknown>;
            },
          },
        );

        if (userData) {
          await updateDoc(userRef, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(userRef, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await signInWithRedirect(auth, googleProvider);
  };

  const signInAsGuest = async () => {
    await signInWithEmailAndPassword(auth, "convidado@newpr.com", "ggamestv27122007");
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signInAsGuest,
      signOut,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}

