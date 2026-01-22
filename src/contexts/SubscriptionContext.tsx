import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getSubscriptionData,
  hasActiveSubscription,
  type SubscriptionData,
  type SubscriptionStatus,
} from "../services/subscription.service";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../config/firebase";

type SubscriptionContextValue = {
  subscription: SubscriptionData | null;
  loading: boolean;
  isActive: boolean;
  refreshSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

type SubscriptionProviderProps = {
  children: ReactNode;
};

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const subscriptionData = await getSubscriptionData(user.uid);
      if (mountedRef.current) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error("[SUBSCRIPTION] Erro ao buscar assinatura:", error);
      if (mountedRef.current) {
        setSubscription(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const subscriptionRef = doc(firestore, "users", user.uid, "subscription", "current");

    // Busca inicial
    refreshSubscription();

    // Escuta mudanças em tempo real
    const unsubscribe = onSnapshot(
      subscriptionRef,
      (snapshot) => {
        if (!mountedRef.current) return;

        if (snapshot.exists()) {
          const data = snapshot.data();
          setSubscription({
            status: data.status as SubscriptionStatus,
            stripeCustomerId: data.stripeCustomerId,
            stripeSubscriptionId: data.stripeSubscriptionId,
            currentPeriodEnd: data.currentPeriodEnd?.toDate() || null,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
            updatedAt: data.updatedAt,
            createdAt: data.createdAt,
          });
        } else {
          setSubscription(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("[SUBSCRIPTION] Erro no listener:", error);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [user]);

  const isActive = useMemo(() => {
    if (!subscription || !subscription.status) {
      return false;
    }
    return ["active", "trialing"].includes(subscription.status);
  }, [subscription]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      loading,
      isActive,
      refreshSubscription,
    }),
    [subscription, loading, isActive]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription deve ser usado dentro de SubscriptionProvider");
  }
  return context;
}
