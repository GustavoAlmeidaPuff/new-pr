import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { updateSubscriptionData } from "../../services/subscription.service";
import { useAuth } from "../../contexts/AuthContext";

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSubscription, isActive } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processSuccess = async () => {
      if (!user || !sessionId) {
        setError("Dados de sessão inválidos");
        setLoading(false);
        return;
      }

      try {
        // Aqui você normalmente chamaria um endpoint do backend para verificar
        // a sessão do Stripe e atualizar o status da assinatura.
        // Por enquanto, vamos atualizar diretamente como "active"
        // Em produção, você deve usar webhooks do Stripe para isso
        
        await updateSubscriptionData(user.uid, {
          status: "active",
          stripeSubscriptionId: sessionId,
        });

        // Atualiza o contexto
        await refreshSubscription();

        // Redireciona imediatamente após salvar
        setLoading(false);
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Erro ao processar sucesso do checkout:", err);
        setError("Erro ao processar sua assinatura. Entre em contato com o suporte.");
        setLoading(false);
      }
    };

    processSuccess();
  }, [user, sessionId, navigate, refreshSubscription]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-text-muted">Processando sua assinatura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-text">Erro</h1>
          <p className="text-text-muted">{error}</p>
          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 rounded-2xl bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">Assinatura Confirmada!</h1>
          <p className="text-text-muted">
            Sua assinatura foi ativada com sucesso. Você já pode usar todos os recursos do aplicativo.
          </p>
        </div>
        <p className="text-sm text-text-muted">
          Redirecionando para a página inicial...
        </p>
      </div>
    </div>
  );
}
