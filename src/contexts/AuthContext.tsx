import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
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
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const redirectResultCheckedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let authUnsubscribe: (() => void) | null = null;

    const initialize = async () => {
      // IMPORTANTE: getRedirectResult só pode ser chamado UMA VEZ e ANTES de configurar listeners
      if (!redirectResultCheckedRef.current) {
        redirectResultCheckedRef.current = true;
        
        try {
          console.log("[AUTH] Verificando resultado do redirect...");
          const result = await getRedirectResult(auth);
          if (result && mountedRef.current) {
            console.log("[AUTH] ✅ Login via redirect bem-sucedido:", result.user.email);
            // O usuário já está autenticado, o onAuthStateChanged vai detectar
          } else {
            console.log("[AUTH] ℹ️  Nenhum redirect pendente (acesso normal)");
          }
        } catch (error) {
          console.error("[AUTH] ❌ Erro no redirect:", error);
        }
      }

      // Agora configura o listener de autenticação
      authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!mountedRef.current) return;

        console.log("[AUTH] 🔄 onAuthStateChanged disparado. User:", currentUser?.email || "null");

        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          console.log("[AUTH] 👤 Usuário autenticado, atualizando Firestore...");
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
            console.log("[AUTH] ✅ Dados do usuário salvos no Firestore");
          } catch (error) {
            console.error("[AUTH] ❌ Erro ao salvar dados no Firestore:", error);
          }
        } else {
          console.log("[AUTH] ⚠️  Usuário não autenticado");
        }
      });
    };

    initialize();

    return () => {
      mountedRef.current = false;
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("[AUTH] 🚀 Iniciando login com Google via popup...");
      
      // Tenta usar popup primeiro (mais confiável)
      const result = await signInWithPopup(auth, googleProvider);
      console.log("[AUTH] ✅ Login via popup bem-sucedido:", result.user.email);
    } catch (error: any) {
      console.error("[AUTH] ❌ Erro no popup:", error);
      
      // Se popup falhar (bloqueado), tenta redirect como fallback
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.log("[AUTH] 🔄 Popup bloqueado, tentando redirect...");
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw error;
      }
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
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

