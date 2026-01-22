import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";

export function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
          <XCircle className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">Checkout Cancelado</h1>
          <p className="text-text-muted">
            Você cancelou o processo de assinatura. Nenhum pagamento foi processado.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full rounded-2xl bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Tentar Novamente</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-2xl border border-border bg-background-card px-6 py-3 text-text font-semibold hover:bg-background-elevated"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
