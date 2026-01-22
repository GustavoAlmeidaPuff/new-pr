import { useEffect, useState } from "react";
import { getStripe } from "../config/stripe";
import type { Stripe } from "@stripe/stripe-js";

/**
 * Hook para usar o Stripe no React
 * @returns Objeto com a instância do Stripe e estado de carregamento
 */
export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    getStripe()
      .then((stripeInstance) => {
        if (mounted) {
          setStripe(stripeInstance);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Erro ao carregar Stripe"));
          setStripe(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { stripe, loading, error };
}
