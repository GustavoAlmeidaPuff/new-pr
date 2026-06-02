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
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { clearFirestoreCache, getDocumentData } from "../cache/firestoreCache";
import { firestore, googleProvider } from "../config/firebase";
import {
  type AccountSlot,
  type AccountSummary,
  getAuthForSlot,
  getFirstEmptySlot,
  getStoredActiveSlot,
  setStoredActiveSlot,
  toAccountSummary,
} from "../lib/accountSlots";

type SlotUsers = [User | null, User | null];

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  activeSlot: AccountSlot;
  accounts: AccountSummary[];
  hasMultipleAccounts: boolean;
  canAddAccount: boolean;
  switchAccount: (slot: AccountSlot) => void;
  signInWithGoogle: (slot?: AccountSlot) => Promise<void>;
  signUpWithEmail: (email: string, password: string, slot?: AccountSlot) => Promise<void>;
  signInWithEmail: (email: string, password: string, slot?: AccountSlot) => Promise<void>;
  signOut: (slot?: AccountSlot) => Promise<void>;
  resolveLoginSlot: (preferredSlot?: AccountSlot) => AccountSlot;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

async function syncUserToFirestore(currentUser: User) {
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

function getOtherSlot(slot: AccountSlot): AccountSlot {
  return slot === 0 ? 1 : 0;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [slotUsers, setSlotUsers] = useState<SlotUsers>([null, null]);
  const [activeSlot, setActiveSlot] = useState<AccountSlot>(() => getStoredActiveSlot());
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const redirectResultCheckedRef = useRef(false);
  const slotUsersRef = useRef<SlotUsers>([null, null]);
  const activeSlotRef = useRef<AccountSlot>(activeSlot);

  useEffect(() => {
    slotUsersRef.current = slotUsers;
  }, [slotUsers]);

  useEffect(() => {
    activeSlotRef.current = activeSlot;
  }, [activeSlot]);

  const ensureUniqueAccount = useCallback(async (slot: AccountSlot, newUser: User) => {
    const otherSlot = getOtherSlot(slot);
    const otherUser = slotUsersRef.current[otherSlot] ?? getAuthForSlot(otherSlot).currentUser;

    if (otherUser?.uid === newUser.uid) {
      await firebaseSignOut(getAuthForSlot(slot));
      throw new Error("Esta conta já está adicionada neste aparelho.");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const slotReady = [false, false];
    const unsubscribes: Array<() => void> = [];

    const markReady = () => {
      if (slotReady[0] && slotReady[1] && mountedRef.current) {
        setLoading(false);
      }
    };

    const initialize = async () => {
      if (!redirectResultCheckedRef.current) {
        redirectResultCheckedRef.current = true;

        try {
          const result = await getRedirectResult(getAuthForSlot(0));
          if (result?.user && mountedRef.current) {
            await ensureUniqueAccount(0, result.user);
          }
        } catch (error) {
          console.error("[AUTH] Erro no redirect:", error);
        }
      }

      ([0, 1] as AccountSlot[]).forEach((slot) => {
        const authInstance = getAuthForSlot(slot);
        const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
          if (!mountedRef.current) return;

          setSlotUsers((previous) => {
            const next: SlotUsers = [...previous] as SlotUsers;
            next[slot] = currentUser;
            return next;
          });

          if (currentUser) {
            try {
              await syncUserToFirestore(currentUser);
            } catch (error) {
              console.error("[AUTH] Erro ao salvar dados no Firestore:", error);
            }
          } else if (slot === activeSlotRef.current) {
            const otherSlot = getOtherSlot(slot);
            const otherUser =
              slotUsersRef.current[otherSlot] ?? getAuthForSlot(otherSlot).currentUser;

            if (otherUser) {
              clearFirestoreCache();
              setActiveSlot(otherSlot);
              setStoredActiveSlot(otherSlot);
            }
          }

          if (!slotReady[slot]) {
            slotReady[slot] = true;
            markReady();
          }
        });

        unsubscribes.push(unsubscribe);
      });
    };

    initialize();

    return () => {
      mountedRef.current = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [ensureUniqueAccount]);

  useEffect(() => {
    if (!slotUsers[activeSlot] && slotUsers[getOtherSlot(activeSlot)]) {
      const fallbackSlot = getOtherSlot(activeSlot);
      setActiveSlot(fallbackSlot);
      setStoredActiveSlot(fallbackSlot);
    }
  }, [activeSlot, slotUsers]);

  const accounts = useMemo(
    () =>
      ([0, 1] as AccountSlot[])
        .map((slot) => {
          const accountUser = slotUsers[slot];
          return accountUser ? toAccountSummary(slot, accountUser) : null;
        })
        .filter((account): account is AccountSummary => account !== null),
    [slotUsers],
  );

  const user = slotUsers[activeSlot];
  const hasMultipleAccounts = accounts.length > 1;
  const canAddAccount = accounts.length < 2;

  const switchAccount = useCallback(
    (slot: AccountSlot) => {
      if (!slotUsers[slot] || slot === activeSlot) {
        return;
      }

      clearFirestoreCache();
      setActiveSlot(slot);
      setStoredActiveSlot(slot);
    },
    [activeSlot, slotUsers],
  );

  const resolveLoginSlot = useCallback(
    (preferredSlot?: AccountSlot): AccountSlot => {
      if (preferredSlot !== undefined && !slotUsers[preferredSlot]) {
        return preferredSlot;
      }

      return getFirstEmptySlot(slotUsers) ?? 0;
    },
    [slotUsers],
  );

  const signInWithGoogle = async (slot?: AccountSlot) => {
    const targetSlot = resolveLoginSlot(slot);
    const authInstance = getAuthForSlot(targetSlot);

    try {
      const result = await signInWithPopup(authInstance, googleProvider);
      await ensureUniqueAccount(targetSlot, result.user);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };

      if (
        firebaseError.code === "auth/popup-blocked" ||
        firebaseError.code === "auth/popup-closed-by-user"
      ) {
        await signInWithRedirect(authInstance, googleProvider);
        return;
      }

      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, slot?: AccountSlot) => {
    const targetSlot = resolveLoginSlot(slot);
    const authInstance = getAuthForSlot(targetSlot);
    const result = await createUserWithEmailAndPassword(authInstance, email, password);
    await ensureUniqueAccount(targetSlot, result.user);
  };

  const signInWithEmail = async (email: string, password: string, slot?: AccountSlot) => {
    const targetSlot = resolveLoginSlot(slot);
    const authInstance = getAuthForSlot(targetSlot);
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    await ensureUniqueAccount(targetSlot, result.user);
  };

  const signOut = async (slot?: AccountSlot) => {
    const targetSlot = slot ?? activeSlotRef.current;
    clearFirestoreCache();
    await firebaseSignOut(getAuthForSlot(targetSlot));
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      activeSlot,
      accounts,
      hasMultipleAccounts,
      canAddAccount,
      switchAccount,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signOut,
      resolveLoginSlot,
    }),
    [
      accounts,
      activeSlot,
      canAddAccount,
      hasMultipleAccounts,
      loading,
      resolveLoginSlot,
      switchAccount,
      user,
    ],
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
