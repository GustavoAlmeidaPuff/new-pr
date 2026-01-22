import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useSubscription } from "../../contexts/SubscriptionContext";

type SubscriptionGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Componente que bloqueia o conteúdo se o usuário não tiver assinatura ativa
 */
export function SubscriptionGate({ children, fallback }: SubscriptionGateProps) {
  const { isActive, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isActive) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background-card p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-text">Acesso Premium Necessário</h3>
        <p className="mb-6 text-sm text-text-muted">
          Esta funcionalidade requer uma assinatura ativa.
        </p>
        <button
          onClick={() => navigate("/checkout")}
          className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Assinar Agora
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
