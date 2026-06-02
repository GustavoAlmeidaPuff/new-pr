import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FirebaseError } from "firebase/app";

import { useAuth } from "../../contexts/AuthContext";
import type { AccountSlot } from "../../lib/accountSlots";

type AuthMode = "login" | "signup";

function getAuthErrorMessage(error: unknown, mode: AuthMode): string {
  if (error instanceof Error && error.message === "Esta conta já está adicionada neste aparelho.") {
    return error.message;
  }

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

type AccountAuthFormProps = {
  targetSlot?: AccountSlot;
  title: string;
  description: string;
  onSuccess?: () => void;
  showGoogle?: boolean;
};

export function AccountAuthForm({
  targetSlot,
  title,
  description,
  onSuccess,
  showGoogle = true,
}: AccountAuthFormProps) {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, resolveLoginSlot } = useAuth();
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginSlot = targetSlot ?? resolveLoginSlot();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setAuthenticating(true);
      await signInWithGoogle(loginSlot);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err, mode));
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
        await signUpWithEmail(trimmedEmail, password, loginSlot);
      } else {
        await signInWithEmail(trimmedEmail, password, loginSlot);
      }

      onSuccess?.();
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

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-text-muted">{description}</p>
      </div>

      {error && (
        <div className="w-full rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-xs text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="flex w-full flex-col gap-3">
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

      {showGoogle && (
        <>
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authenticating}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background-card px-6 py-3 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Entrar com Google
          </button>
        </>
      )}
    </div>
  );
}

type AddAccountPageProps = {
  onAuthenticated?: () => void;
};

export function AddAccountPanel({ onAuthenticated }: AddAccountPageProps) {
  const { canAddAccount, resolveLoginSlot } = useAuth();
  const navigate = useNavigate();
  const targetSlot = resolveLoginSlot(1);

  useEffect(() => {
    if (!canAddAccount) {
      navigate("/config", { replace: true });
    }
  }, [canAddAccount, navigate]);

  if (!canAddAccount) {
    return null;
  }

  return (
    <AccountAuthForm
      targetSlot={targetSlot}
      title="Segunda conta"
      description="Entre com outra conta para alternar rapidamente entre perfis no mesmo celular."
      onSuccess={() => {
        onAuthenticated?.();
        navigate("/config", { replace: true });
      }}
    />
  );
}
