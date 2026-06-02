import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { getAccountInitial, getAccountLabel, type AccountSummary } from "../../lib/accountSlots";

type AccountAvatarProps = {
  account: AccountSummary;
  active: boolean;
  onClick: () => void;
};

function AccountAvatar({ account, active, onClick }: AccountAvatarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={getAccountLabel(account)}
      className={[
        "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition",
        active
          ? "border-primary ring-2 ring-primary/30"
          : "border-border opacity-80 hover:border-primary/50 hover:opacity-100",
      ].join(" ")}
    >
      {account.photoURL ? (
        <img src={account.photoURL} alt={getAccountLabel(account)} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-primary">{getAccountInitial(account)}</span>
      )}
    </button>
  );
}

export function AccountSwitcher() {
  const { accounts, activeSlot, hasMultipleAccounts, canAddAccount, switchAccount } = useAuth();
  const navigate = useNavigate();

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background-card/80 px-3 py-2 backdrop-blur-sm">
      <div className="min-w-0 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Conta ativa</p>
        <p className="truncate text-sm font-medium text-white">
          {getAccountLabel(accounts.find((account) => account.slot === activeSlot) ?? accounts[0])}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {accounts.map((account) => (
          <AccountAvatar
            key={account.uid}
            account={account}
            active={account.slot === activeSlot}
            onClick={() => switchAccount(account.slot)}
          />
        ))}

        {canAddAccount && (
          <button
            type="button"
            onClick={() => navigate("/contas/adicionar")}
            title="Adicionar segunda conta"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border text-text-muted transition hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}

        {hasMultipleAccounts && (
          <span className="hidden text-[10px] font-medium text-text-muted sm:inline">
            Toque para trocar
          </span>
        )}
      </div>
    </div>
  );
}
