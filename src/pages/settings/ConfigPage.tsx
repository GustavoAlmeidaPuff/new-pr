import { ArrowUpRight, Bell, Download, HelpCircle, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

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

export function ConfigPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleProfile = () => {
    // TODO: abrir modal de perfil.
    console.info("Perfil acionado");
  };

  const handleNotifications = () => {
    console.info("Notificações acionado");
  };

  const handleExportData = () => {
    console.info("Exportar dados acionado");
  };

  const handleHelp = () => {
    console.info("Ajuda acionado");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-text-muted">Personalize sua experiência no New PR.</p>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Conta</h2>
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
                  {user?.displayName?.[0]?.toUpperCase() ?? "N"}
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-white">{user?.displayName ?? "Atleta New PR"}</p>
                <p className="text-xs text-text-muted">{user?.email ?? "Sem e-mail cadastrado"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <SettingsActionCard
              title="Perfil"
              description="Gerenciar informações pessoais"
              icon={User}
              onClick={handleProfile}
            />
            <SettingsActionCard
              title="Notificações"
              description="Preferências de alertas"
              icon={Bell}
              onClick={handleNotifications}
            />
          </div>
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
            title="Ajuda"
            description="Central de suporte"
            icon={HelpCircle}
            onClick={handleHelp}
          />
          <SettingsActionCard
            title="Sair"
            description="Encerrar sessão"
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

