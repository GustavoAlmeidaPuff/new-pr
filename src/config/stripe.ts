import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

// Chave pública da Stripe (pode ser exposta no frontend)
const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  "pk_live_51Qpz6ZK93uKWMFcx82TDj8DR1ZKPjTqIk8DeCnaHhlmt0jUxXw1bty2odEitug7r2AJmlgLVPtADchdiD1JEIfct00xL0tzu8w";

// Inicializa o Stripe com a chave pública
let stripePromise: Promise<Stripe | null>;

/**
 * Obtém uma instância do Stripe carregada com a chave pública
 * @returns Promise com a instância do Stripe ou null se houver erro
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Exporta a chave pública
export const STRIPE_PUBLISHABLE_KEY = stripePublishableKey;
