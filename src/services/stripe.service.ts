import { getStripe } from "../config/stripe";
import type { Stripe } from "@stripe/stripe-js";

/**
 * Serviço para interagir com a Stripe
 */
export class StripeService {
  private static stripeInstance: Stripe | null = null;

  /**
   * Inicializa e retorna a instância do Stripe
   */
  static async getInstance(): Promise<Stripe | null> {
    if (!this.stripeInstance) {
      this.stripeInstance = await getStripe();
    }
    return this.stripeInstance;
  }

  /**
   * Redireciona para o checkout da Stripe
   * @param priceId ID do preço do produto no Stripe
   * @param successUrl URL de redirecionamento após sucesso
   * @param cancelUrl URL de redirecionamento após cancelamento
   */
  static async redirectToCheckout(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<void> {
    const stripe = await this.getInstance();
    if (!stripe) {
      throw new Error("Stripe não foi inicializado corretamente");
    }

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: "subscription", // ou "payment" para pagamento único
      successUrl,
      cancelUrl,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Cria uma sessão de checkout
   * Nota: Esta função requer um backend para criar a sessão de checkout
   * O frontend não pode criar sessões diretamente por questões de segurança
   */
  static async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    // Esta função deve chamar um endpoint do backend
    // que criará a sessão de checkout usando a chave secreta
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar sessão de checkout");
    }

    const { sessionId } = await response.json();
    return sessionId;
  }
}
