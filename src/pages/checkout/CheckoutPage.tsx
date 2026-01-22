import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, CheckCircle2, XCircle } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { useStripe } from "../../hooks";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { updateSubscriptionData } from "../../services/subscription.service";
import { functions, auth } from "../../config/firebase";

export function CheckoutPage() {
  const { stripe, loading: stripeLoading } = useStripe();
  const { user } = useAuth();
  const { isActive, subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReactNode | null>(null);

  // IMPORTANTE: Substitua este priceId pelo ID do seu produto no Stripe
  // Você precisa criar um produto e um price no dashboard do Stripe
  // Configure a variável VITE_STRIPE_PRICE_ID no arquivo .env.local
  const PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID;

  if (!PRICE_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
            <Lock className="h-8 w-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-text">Configuração Necessária</h1>
          <p className="text-text-muted">
            O Price ID do Stripe não foi configurado. Por favor, adicione a variável
            <code className="mx-1 rounded bg-background-elevated px-2 py-1 text-xs">VITE_STRIPE_PRICE_ID</code>
            no arquivo <code className="mx-1 rounded bg-background-elevated px-2 py-1 text-xs">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // SOLUÇÃO SIMPLES: Usar Payment Link do Stripe
      // Esta é a forma mais simples e não requer backend
      const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
      
      if (PAYMENT_LINK) {
        // Redireciona para o Payment Link com referência do usuário
        window.location.href = `${PAYMENT_LINK}?client_reference_id=${user.uid}`;
        return;
      }

      // Se não tiver Payment Link, tenta usar Firebase Functions
      try {
        const idToken = await user.getIdToken();
        
        const response = await fetch(
          `https://us-central1-new-pr-app.cloudfunctions.net/createCheckoutSessionHttp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              priceId: PRICE_ID,
              successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${window.location.origin}/checkout/cancel`,
              customerEmail: user.email,
              origin: window.location.origin,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao criar sessão de checkout");
        }

        const data = await response.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("URL da sessão não foi retornada");
        }
      } catch (functionsError: any) {
        // Se Firebase Functions falhar, mostra instruções para criar Payment Link
        throw new Error(
          "Configure um Payment Link do Stripe. Veja as instruções abaixo ou configure Firebase Functions."
        );
      }
    } catch (err: any) {
      console.error("Erro ao processar checkout:", err);
      
      if (err.message?.includes("Payment Link")) {
        setError(
          <>
            <p className="mb-2">{err.message}</p>
            <div className="mt-3 space-y-2 text-xs">
              <p className="font-semibold">Como criar um Payment Link no Stripe:</p>
              <ol className="list-decimal list-inside space-y-1 text-text-muted">
                <li>Acesse <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-primary underline">dashboard.stripe.com/products</a></li>
                <li>Clique no produto "Mensalidade New Pr"</li>
                <li>
                  <strong>Opção 1:</strong> Na seção "Preços", clique no botão <strong>"+"</strong> ao lado de "Preços" e selecione "Criar link de pagamento"
                </li>
                <li>
                  <strong>Opção 2:</strong> Clique no menu de três pontos (⋮) ao lado do preço e procure por "Criar link" ou "Create payment link"
                </li>
                <li>
                  <strong>Opção 3:</strong> No menu lateral do Stripe, procure por "Payment Links" ou "Links de pagamento" e clique em "Criar link"
                </li>
                <li>Configure as URLs:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Sucesso: <code className="bg-background-elevated px-1 rounded text-xs">http://localhost:5173/checkout/success?session_id={"{CHECKOUT_SESSION_ID}"}</code></li>
                    <li>Cancelamento: <code className="bg-background-elevated px-1 rounded text-xs">http://localhost:5173/checkout/cancel</code></li>
                  </ul>
                </li>
                <li>Copie o link gerado (começa com <code className="bg-background-elevated px-1 rounded text-xs">https://buy.stripe.com/</code>)</li>
                <li>Adicione ao arquivo <code className="bg-background-elevated px-1 rounded">.env.local</code> como: <code className="bg-background-elevated px-1 rounded">VITE_STRIPE_PAYMENT_LINK=seu-link-aqui</code></li>
              </ol>
              <p className="mt-2 text-xs text-text-muted">
                <strong>Dica:</strong> Se não encontrar a opção, acesse diretamente: <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noopener noreferrer" className="text-primary underline">dashboard.stripe.com/payment-links</a>
              </p>
            </div>
          </>
        );
      } else {
        setError(err.message || "Erro ao processar checkout");
      }
      setLoading(false);
    }
  };

  // Se já tem assinatura ativa, redireciona para home
  if (isActive) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Acesso Premium Necessário</h1>
          <p className="text-text-muted">
            Para continuar usando o aplicativo, você precisa de uma assinatura ativa.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">Benefícios da Assinatura</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-text-muted">Acesso completo a todos os recursos</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-text-muted">Treinos e exercícios ilimitados</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-text-muted">Periodizações avançadas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-text-muted">Análises e gráficos detalhados</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-500">Erro</p>
              <div className="text-sm text-red-400">
                {typeof error === "string" ? <p>{error}</p> : error}
              </div>
            </div>
          </div>
        )}

        {subscription?.status === "canceled" && (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-600">
              Sua assinatura foi cancelada. Renove para continuar usando o aplicativo.
            </p>
          </div>
        )}

        {/* Botão para ativar manualmente se já pagou */}
        {!isActive && (
          <button
            onClick={async () => {
              if (!user) return;
              setLoading(true);
              setError(null);
              try {
                await updateSubscriptionData(user.uid, {
                  status: "active",
                  stripeSubscriptionId: "manual_activation",
                });
                await refreshSubscription();
                navigate("/");
              } catch (err) {
                setError("Erro ao ativar assinatura. Tente novamente.");
                setLoading(false);
              }
            }}
            className="w-full rounded-2xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Já paguei - Ativar Assinatura
          </button>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || stripeLoading || !stripe}
          className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading || stripeLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>Assinar Agora</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-text-muted">
          Ao assinar, você concorda com nossos termos de serviço e política de privacidade.
        </p>
      </div>
    </div>
  );
}
