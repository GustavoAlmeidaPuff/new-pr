import { CheckCircle2, Flame, Medal, TimerReset } from "lucide-react";

import type { Periodization } from "..";

type PeriodizationCardProps = {
  periodization: Periodization;
  onActivate?: (id: string) => void;
};

function getStatusBadge(status: Periodization["status"]) {
  switch (status) {
    case "active":
      return {
        label: "Ativo",
        icon: Flame,
        bg: "bg-primary/15",
        text: "text-primary",
      };
    case "completed":
      return {
        label: "Concluído",
        icon: CheckCircle2,
        bg: "bg-success/15",
        text: "text-success",
      };
    default:
      return {
        label: "Próximo",
        icon: TimerReset,
        bg: "bg-warning/15",
        text: "text-warning",
      };
  }
}

export function PeriodizationCard({ periodization, onActivate }: PeriodizationCardProps) {
  const badge = getStatusBadge(periodization.status);
  const isActive = periodization.status === "active";

  return (
    <article className="space-y-4 rounded-3xl border border-border bg-background-card p-5 shadow-card">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
            <badge.icon className="h-4 w-4" />
            {badge.label}
          </div>
          <h2 className="text-xl font-semibold text-white">{periodization.name}</h2>
        </div>
        {!isActive && (
          <button
            type="button"
            onClick={() => onActivate?.(periodization.id)}
            className="rounded-full border border-primary/40 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
          >
            Ativar
          </button>
        )}
      </header>

      <div className="rounded-2xl border border-border/60 bg-background-elevated/30 p-3 text-sm">
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <Medal className="h-4 w-4 text-primary" />
          PRs neste ciclo
        </p>
        <p className="mt-1 text-base font-semibold text-white">{periodization.prs}</p>
      </div>
    </article>
  );
}

