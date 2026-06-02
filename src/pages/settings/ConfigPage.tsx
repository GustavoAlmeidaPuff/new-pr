import { ArrowUpRight, Download, LogOut, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "../../components/loading";
import { useAuth } from "../../contexts/AuthContext";
import { getAccountInitial, getAccountLabel, type AccountSummary } from "../../lib/accountSlots";

type SettingsActionCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: "default" | "danger";
};

function SettingsActionCard({ title, description, icon: Icon, onClick, variant = "default" }: SettingsActionCardProps) {
  const isDanger = variant === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-4 rounded-3xl border px-4 py-4 text-left transition ${
        isDanger
          ? "border-danger/40 bg-danger/10 text-danger hover:bg-danger/20"
          : "border-border bg-background-card text-white hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isDanger ? "bg-danger/15 text-danger" : "bg-primary/15 text-primary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <ArrowUpRight className={isDanger ? "h-4 w-4 text-danger/80" : "h-4 w-4 text-text-muted"} />
    </button>
  );
}

type AccountCardProps = {
  account: AccountSummary;
  active: boolean;
  onSelect: () => void;
};

function AccountCard({ account, active, onSelect }: AccountCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left transition",
        active
          ? "border-primary/50 bg-primary/10"
          : "border-border bg-background-card hover:border-primary/30 hover:bg-primary/5",
      ].join(" ")}
    >
      {account.photoURL ? (
        <img
          src={account.photoURL}
          alt={getAccountLabel(account)}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
          {getAccountInitial(account)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{getAccountLabel(account)}</p>
        <p className="truncate text-xs text-text-muted">{account.email ?? "Sem e-mail cadastrado"}</p>
      </div>
      {active && (
        <span className="rounded-full bg-primary/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Ativa
        </span>
      )}
    </button>
  );
}

export function ConfigPage() {
  const {
    user,
    accounts,
    activeSlot,
    canAddAccount,
    hasMultipleAccounts,
    switchAccount,
    signOut,
    loading,
  } = useAuth();
  const navigate = useNavigate();

  const handleExportData = () => {
    console.info("Exportar dados acionado");
  };

  const handleLogout = async () => {
    const otherAccountExists = accounts.some((account) => account.slot !== activeSlot);
    await signOut();

    if (!otherAccountExists) {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-48 rounded-full" />
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-background-card/40 p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-3 w-32 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-3xl" />
          ))}
        </div>

        <Skeleton className="h-4 w-24 rounded-full" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-text-muted">Personalize sua experiência no New PR.</p>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {hasMultipleAccounts ? "Contas neste aparelho" : "Conta"}
          </h2>

          {hasMultipleAccounts ? (
            <div className="space-y-2">
              {accounts.map((account) => (
                <AccountCard
                  key={account.uid}
                  account={account}
                  active={account.slot === activeSlot}
                  onSelect={() => switchAccount(account.slot)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-background-card p-5">
              <div className="flex items-center gap-4">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "Foto do usuário"}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold text-primary">
                    {user?.displayName?.[0]?.toUpperCase() ??
                      user?.email?.[0]?.toUpperCase() ??
                      "N"}
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-white">
                    {user?.displayName ?? user?.email ?? "Atleta New PR"}
                  </p>
                  <p className="text-xs text-text-muted">{user?.email ?? "Sem e-mail cadastrado"}</p>
                </div>
              </div>
            </div>
          )}

          {canAddAccount && (
            <SettingsActionCard
              title="Adicionar segunda conta"
              description="Alterne rápido entre dois perfis no mesmo celular"
              icon={UserPlus}
              onClick={() => navigate("/contas/adicionar")}
            />
          )}

          {hasMultipleAccounts && (
            <p className="px-1 text-xs text-text-muted">
              Use o seletor no topo do app ou toque em uma conta acima para trocar na hora de registrar PRs.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Dados</h2>
          <SettingsActionCard
            title="Exportar dados"
            description="Backup dos seus PRs"
            icon={Download}
            onClick={handleExportData}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Suporte</h2>
          <SettingsActionCard
            title={hasMultipleAccounts ? "Sair da conta ativa" : "Sair"}
            description={
              hasMultipleAccounts
                ? "Encerra só a conta em uso; a outra continua disponível"
                : "Encerrar sessão"
            }
            icon={LogOut}
            onClick={handleLogout}
            variant="danger"
          />
        </section>
      </div>

      <footer className="pt-4 text-center text-xs text-text-muted">
        New PR v1.0.0
      </footer>
    </section>
  );
}
