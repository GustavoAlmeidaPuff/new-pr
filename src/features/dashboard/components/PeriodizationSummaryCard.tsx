import { CalendarDays, Medal, Plus, TrendingUp } from "lucide-react";

import type { DashboardPeriodization } from "..";

type PeriodizationSummaryCardProps = {
  periodization: DashboardPeriodization | null;
};

export function PeriodizationSummaryCard({ periodization }: PeriodizationSummaryCardProps) {
  if (!periodization) {
    return (
      <div className="space-y-4 rounded-3xl border border-dashed border-border bg-background-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted">Periodização</p>
            <h2 className="text-xl font-semibold">Nenhuma ativa</h2>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Criar
          </button>
        </div>
        <p className="text-sm text-text-muted">
          Crie uma periodização para acompanhar sua evolução em ciclos de Base, Shock e Deload.
        </p>
      </div>
    );
  }

  const { stats } = periodization;

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background-card to-background-muted shadow-card">
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {periodization.status === "active" ? "Ativo" : "Período"}
            </span>
            <span className="text-xs text-text-muted">Periodização</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">{periodization.name}</h2>
        </div>
        <button
          type="button"
          className="rounded-full border border-primary/30 bg-primary/10 p-2 text-primary transition hover:bg-primary/20"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 py-6 text-sm">
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background-elevated/30 p-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <CalendarDays className="h-4 w-4 text-primary" />
            Duração
          </div>
          <p className="text-lg font-semibold text-white">{stats.days} dias</p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background-elevated/30 p-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Medal className="h-4 w-4 text-primary" />
            PRs novos
          </div>
          <p className="text-lg font-semibold text-white">{stats.newPrs}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background-elevated/30 p-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <TrendingUp className="h-4 w-4 text-primary" />
            Volume
          </div>
          <p className="text-lg font-semibold text-white">
            {stats.volumeChangePercent > 0 ? "+" : ""}
            {stats.volumeChangePercent}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 bg-background-elevated/40 px-5 py-4 text-xs text-text-muted">
        <span>
          Iniciado em{" "}
          <strong className="font-semibold text-white">
            {new Date(periodization.startDate).toLocaleDateString("pt-BR")}
          </strong>
        </span>
        <span>
          Progresso{" "}
          <strong className="font-semibold text-white">{periodization.progressPercent}%</strong>
        </span>
      </div>
    </article>
  );
}

