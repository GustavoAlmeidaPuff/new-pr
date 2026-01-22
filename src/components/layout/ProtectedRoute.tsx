import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Skeleton } from "../loading";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../contexts/SubscriptionContext";

export function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subscriptionLoading } = useSubscription();
  const location = useLocation();

  const loading = authLoading || subscriptionLoading;
  const isCheckoutPage = location.pathname === "/checkout" || 
                         location.pathname === "/checkout/success" || 
                         location.pathname === "/checkout/cancel";

  console.log("[PROTECTED ROUTE]", { 
    authLoading, 
    subscriptionLoading,
    hasUser: !!user, 
    userEmail: user?.email,
    isActive,
    pathname: location.pathname 
  });

  if (loading) {
    console.log("[PROTECTED ROUTE] Mostrando loading...");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[PROTECTED ROUTE] Sem usuário, redirecionando para /login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Permite acesso às páginas de checkout mesmo sem assinatura ativa
  if (isCheckoutPage) {
    console.log("[PROTECTED ROUTE] Página de checkout, permitindo acesso");
    return <Outlet />;
  }

  // Bloqueia acesso se não tiver assinatura ativa
  if (!isActive) {
    console.log("[PROTECTED ROUTE] Usuário sem assinatura ativa, redirecionando para /checkout");
    return <Navigate to="/checkout" replace state={{ from: location }} />;
  }

  console.log("[PROTECTED ROUTE] Usuário autenticado e com assinatura ativa, renderizando rota protegida");
  return <Outlet />;
}

