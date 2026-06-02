import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";

import { AccountAuthForm } from "../../components/account/AccountAuthForm";
import { useAuth } from "../../contexts/AuthContext";
import logoImg from "../../assets/logo.png";
import letreiroImg from "../../assets/letreiro.png";
import { Skeleton } from "../../components/loading";

export function LoginPage() {
  const { user, loading } = useAuth();
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

  if (loading) {
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

      <AccountAuthForm
        title="Entrar no New PR"
        description="Use e-mail e senha ou sua conta Google para registrar e acompanhar seus PRs."
      />
    </div>
  );
}
