import { Activity, TrendingDown, TrendingUp } from "lucide-react";

import type { ExercisePR } from "..";
import { formatWeight } from "../utils/formatWeight";

type PRHistoryListProps = {
  history: ExercisePR[];
  weightType?: "total" | "per-side";
};

const trendIconMap: Record<NonNullable<ExercisePR["trend"]>, React.ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  steady: Activity,
};

const trendColorMap: Record<NonNullable<ExercisePR["trend"]>, string> = {
  up: "text-primary",
  down: "text-danger",
  steady: "text-text-muted",
};

export function PRHistoryList({ history, weightType }: PRHistoryListProps) {
  return (
    <article className="space-y-4 rounded-3xl border border-border bg-background-card p-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Histórico de PRs</p>
        <h2 className="text-xl font-semibold text-white">Últimos registros</h2>
      </header>

      <div className="space-y-3">
        {history.map((record) => {
          const TrendIcon = trendIconMap[record.trend ?? "steady"];
          const color = trendColorMap[record.trend ?? "steady"];
          return (
            <div
              key={record.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background-elevated/40 px-4 py-3 text-sm text-white"
            >
              <div>
                <p className="text-sm font-semibold">
                  <span className="text-metric-load">{formatWeight(record.weight, weightType)}</span>{" "}
                  × <span className="text-metric-reps">{record.reps} reps</span>
                </p>
                <p className="text-xs text-text-muted">{record.periodization}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-text-muted">
                  {new Date(record.date).toLocaleDateString("pt-BR")}
                </span>
                <div className="flex items-center gap-2">
                  <TrendIcon className={`h-4 w-4 ${color}`} />
                  <span className="font-medium text-metric-volume">
                    {formatWeight(record.volume, weightType)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

