import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import type { FirebaseError } from "firebase/app";

import { useAuth } from "../../contexts/AuthContext";
import logoImg from "../../assets/logo.png";
import letreiroImg from "../../assets/letreiro.png";
import { Skeleton } from "../../components/loading";

type AuthMode = "login" | "signup";

function getAuthErrorMessage(error: unknown, mode: AuthMode): string {
  const code = (error as FirebaseError)?.code;

  switch (code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado. Tente entrar.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um momento e tente novamente.";
    default:
      return mode === "signup"
        ? "Não foi possível criar a conta. Tente novamente."
        : "Não foi possível entrar. Tente novamente.";
  }
}

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function LoginPage() {
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setError(null);
      setAuthenticating(true);

      if (mode === "signup") {
        await signUpWithEmail(trimmedEmail, password);
      } else {
        await signInWithEmail(trimmedEmail, password);
      }
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err, mode));
      setAuthenticating(false);
    }
  };

  const toggleMode = () => {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setError(null);
  };

  if (loading || (authenticating && !error)) {
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
        <img src={logoImg} alt="New PR Logo" className="h-32 w-32 object-contain" />
        <img src={letreiroImg} alt="New PR" className="h-12 w-auto object-contain" />
      </div>

      <p className="max-w-xs text-sm text-text-muted">
        {mode === "signup"
          ? "Crie sua conta com e-mail e senha para registrar e acompanhar seus PRs."
          : "Entre com e-mail e senha ou use sua conta Google."}
      </p>

      {error && (
        <div className="w-full max-w-xs rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-xs text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="email"
          autoComplete="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={authenticating}
          className={inputClassName}
        />
        <input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={authenticating}
          className={inputClassName}
        />
        <button
          type="submit"
          disabled={authenticating}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {authenticating
            ? "Conectando..."
            : mode === "signup"
              ? "Criar conta"
              : "Entrar com e-mail"}
        </button>
      </form>

      <button
        type="button"
        onClick={toggleMode}
        disabled={authenticating}
        className="text-xs text-text-muted underline-offset-2 hover:text-white hover:underline disabled:opacity-50"
      >
        {mode === "signup" ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
      </button>

      <div className="flex w-full max-w-xs items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-muted">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={authenticating}
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-border bg-background-card px-6 py-3 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Entrar com Google
      </button>
    </div>
  );
}
