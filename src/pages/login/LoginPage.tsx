import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo = useMemo(() => {
    if (location.state && typeof location.state === "object" && "from" in location.state) {
      const from = (location.state as { from?: Location })?.from;
      if (from && "pathname" in from) {
        return from.pathname as string;
      }
    }
    return "/";
  }, [location.state]);

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, navigate, redirectTo, user]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setAuthenticating(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError("Não foi possível conectar com o Google. Tente novamente.");
      setAuthenticating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-text">
      <div>
        <p className="text-sm text-text-muted">Bem-vindo ao</p>
        <h1 className="text-4xl font-semibold">New PR</h1>
      </div>
      <p className="max-w-xs text-sm text-text-muted">
        Entre com sua conta Google para registrar, analisar e acelerar seus PRs.
      </p>
      {error && (
        <div className="w-full max-w-xs rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-xs text-danger">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={authenticating || loading}
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {authenticating || loading ? "Conectando..." : "Entrar com Google"}
      </button>
    </div>
  );
}

