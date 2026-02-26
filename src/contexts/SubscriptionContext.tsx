import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import type { SubscriptionData } from "../services/subscription.service";

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

/**
 * App gratuito: usuário logado tem acesso total (isActive = true).
 * Sem verificação de assinatura/Stripe.
 */
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();

  const isActive = !!user;
  const loading = false;
  const subscription: SubscriptionData | null = null;

  const refreshSubscription = async () => {
    // No-op: não há assinatura para atualizar
  };

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      loading,
      isActive,
      refreshSubscription,
    }),
    [isActive]
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
