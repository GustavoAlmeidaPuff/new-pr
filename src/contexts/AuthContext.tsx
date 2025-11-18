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
  useRef,
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
  const processingRedirectRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Primeiro, verifica se há um redirect result pendente
    const checkRedirectResult = async () => {
      try {
        processingRedirectRef.current = true;
        console.log("[AUTH] Verificando resultado do redirect...");
        const result = await getRedirectResult(auth);
        if (result && mountedRef.current) {
          console.log("[AUTH] Login via redirect bem-sucedido:", result.user.email);
        } else {
          console.log("[AUTH] Nenhum redirect pendente");
        }
      } catch (error) {
        console.error("[AUTH] Erro no redirect:", error);
      } finally {
        processingRedirectRef.current = false;
      }
    };

    checkRedirectResult();

    // Depois, escuta mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mountedRef.current) return;

      console.log("[AUTH] onAuthStateChanged disparado. User:", currentUser?.email || "null");
      console.log("[AUTH] processingRedirect:", processingRedirectRef.current);
      
      // Aguarda um pouco se ainda estiver processando redirect
      if (processingRedirectRef.current) {
        console.log("[AUTH] Aguardando processamento do redirect...");
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        console.log("[AUTH] Usuário autenticado, atualizando Firestore...");
        const userRef = doc(firestore, "users", currentUser.uid);
        
        try {
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
          console.log("[AUTH] Dados do usuário salvos no Firestore");
        } catch (error) {
          console.error("[AUTH] Erro ao salvar dados no Firestore:", error);
        }
      } else {
        console.log("[AUTH] Usuário não autenticado");
      }
    });

    return () => {
      mountedRef.current = false;
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

