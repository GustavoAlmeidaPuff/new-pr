import { ArrowUpRight, Check, Download, LogOut, Share2, UserPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "../../components/loading";
import { useAuth } from "../../contexts/AuthContext";
import { getAccountInitial, getAccountLabel, type AccountSummary } from "../../lib/accountSlots";
import {
  acceptExerciseTransfer,
  createExerciseTransfer,
  declineExerciseTransfer,
  listIncomingExerciseTransfers,
  type ExerciseTransfer,
} from "../../services/exerciseTransfers.service";

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

type FeedbackTone = "success" | "error" | "info";
type Feedback = { tone: FeedbackTone; message: string } | null;

type ShareExercisesModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void> | void;
  submitting: boolean;
  feedback: Feedback;
};

function ShareExercisesModal({ open, onClose, onSubmit, submitting, feedback }: ShareExercisesModalProps) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) setEmail("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6 pt-10 sm:items-center">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-background-card p-5 text-white shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Compartilhar banco de exercícios</h3>
            <p className="text-xs text-text-muted">
              Envia uma cópia de todos os exercícios cadastrados para outra conta. Seus PRs continuam só com você.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-muted hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-text-muted">E-mail do destinatário</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="amigo@exemplo.com"
            className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm text-white outline-none focus:border-primary"
            autoComplete="off"
            disabled={submitting}
          />
        </label>

        {feedback && (
          <p
            className={`text-xs ${
              feedback.tone === "success"
                ? "text-success"
                : feedback.tone === "error"
                  ? "text-danger"
                  : "text-text-muted"
            }`}
          >
            {feedback.message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-border px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting || !email.trim()}
            onClick={() => void onSubmit(email)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
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

  const [shareOpen, setShareOpen] = useState(false);
  const [shareSubmitting, setShareSubmitting] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<Feedback>(null);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);

  const [incoming, setIncoming] = useState<ExerciseTransfer[]>([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [processingTransferId, setProcessingTransferId] = useState<string | null>(null);

  const refreshIncoming = useCallback(async () => {
    if (!user?.email) {
      setIncoming([]);
      return;
    }
    setIncomingLoading(true);
    try {
      const transfers = await listIncomingExerciseTransfers(user.email);
      setIncoming(transfers);
    } catch (error) {
      console.error("Erro ao carregar transferências recebidas:", error);
    } finally {
      setIncomingLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    void refreshIncoming();
  }, [refreshIncoming]);

  const handleExportData = () => {
    console.info("Exportar dados acionado");
  };

  const handleOpenShare = () => {
    if (!user?.uid) return;
    setShareFeedback(null);
    setShareOpen(true);
  };

  const handleShareSubmit = async (rawEmail: string) => {
    if (!user?.uid) return;
    const email = rawEmail.trim();
    if (!email) {
      setShareFeedback({ tone: "error", message: "Informe um e-mail válido." });
      return;
    }
    setShareSubmitting(true);
    setShareFeedback(null);
    try {
      const { count } = await createExerciseTransfer({
        fromUid: user.uid,
        fromEmail: user.email ?? null,
        fromName: user.displayName ?? null,
        toEmail: email,
      });
      setShareOpen(false);
      setPageFeedback({
        tone: "success",
        message: `Transferência enviada com ${count} exercício${count === 1 ? "" : "s"}. Peça pra ${email} aceitar nas configurações.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a transferência.";
      setShareFeedback({ tone: "error", message });
    } finally {
      setShareSubmitting(false);
    }
  };

  const handleAccept = async (transfer: ExerciseTransfer) => {
    if (!user?.uid) return;
    setProcessingTransferId(transfer.id);
    setPageFeedback(null);
    try {
      const result = await acceptExerciseTransfer(transfer.id, user.uid);
      setPageFeedback({
        tone: "success",
        message: `Recebido! ${result.imported} novo${result.imported === 1 ? "" : "s"} exercício${result.imported === 1 ? "" : "s"} importado${result.imported === 1 ? "" : "s"}${result.skipped > 0 ? `, ${result.skipped} já existia${result.skipped === 1 ? "" : "m"}` : ""}.`,
      });
      await refreshIncoming();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível aceitar a transferência.";
      setPageFeedback({ tone: "error", message });
    } finally {
      setProcessingTransferId(null);
    }
  };

  const handleDecline = async (transfer: ExerciseTransfer) => {
    setProcessingTransferId(transfer.id);
    setPageFeedback(null);
    try {
      await declineExerciseTransfer(transfer.id);
      await refreshIncoming();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível recusar a transferência.";
      setPageFeedback({ tone: "error", message });
    } finally {
      setProcessingTransferId(null);
    }
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
          <SettingsActionCard
            title="Compartilhar banco de exercícios"
            description="Envia seus exercícios cadastrados (sem PRs) pra outra conta"
            icon={Share2}
            onClick={handleOpenShare}
          />

          {pageFeedback && (
            <div
              className={`rounded-2xl border px-4 py-3 text-xs ${
                pageFeedback.tone === "success"
                  ? "border-success/40 bg-success/10 text-success"
                  : pageFeedback.tone === "error"
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : "border-border bg-background-card text-text-muted"
              }`}
            >
              {pageFeedback.message}
            </div>
          )}

          {(incomingLoading || incoming.length > 0) && (
            <div className="space-y-2 rounded-3xl border border-border bg-background-card/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Transferências recebidas
              </p>
              {incomingLoading && incoming.length === 0 ? (
                <Skeleton className="h-16 rounded-2xl" />
              ) : (
                incoming.map((transfer) => {
                  const isProcessing = processingTransferId === transfer.id;
                  return (
                    <div
                      key={transfer.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {transfer.fromName ?? transfer.fromEmail ?? "Outro atleta"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {transfer.exercises.length} exercício{transfer.exercises.length === 1 ? "" : "s"} disponível{transfer.exercises.length === 1 ? "" : "is"} pra importar
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleDecline(transfer)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-60"
                        >
                          <X className="h-3.5 w-3.5" /> Recusar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAccept(transfer)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" /> {isProcessing ? "Importando..." : "Aceitar"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
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

      <ShareExercisesModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onSubmit={handleShareSubmit}
        submitting={shareSubmitting}
        feedback={shareFeedback}
      />
    </section>
  );
}
