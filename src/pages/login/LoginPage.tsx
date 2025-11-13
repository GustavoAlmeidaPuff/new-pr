import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import logoImg from "../../assets/logo.png";
import letreiroImg from "../../assets/letreiro.png";
import { Skeleton } from "../../components/loading";

export function LoginPage() {
  const { user, loading, signInWithGoogle, signInAsGuest } = useAuth();
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

  const handleGuestLogin = async () => {
    try {
      setError(null);
      setAuthenticating(true);
      await signInAsGuest();
    } catch (err) {
      console.error(err);
      setError("Não foi possível entrar como convidado. Tente novamente.");
      setAuthenticating(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-text">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
        <Skeleton className="h-4 w-56 rounded-full" />
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Skeleton className="h-12 rounded-full" />
          <Skeleton className="h-12 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-text">
      <div className="flex flex-col items-center gap-4">
        <img 
          src={logoImg} 
          alt="New PR Logo" 
          className="h-32 w-32 object-contain"
        />
        <img 
          src={letreiroImg} 
          alt="New PR" 
          className="h-12 w-auto object-contain"
        />
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
      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={authenticating || loading}
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-text-muted/20 bg-background px-6 py-3 text-sm font-semibold text-text shadow-card transition hover:bg-text-muted/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {authenticating || loading ? "Conectando..." : "Entrar como Convidado"}
      </button>
    </div>
  );
}

