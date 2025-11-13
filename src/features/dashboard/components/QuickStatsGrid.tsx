import type { DashboardQuickStat } from "..";

type QuickStatsGridProps = {
  stats: DashboardQuickStat[];
};

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-3xl border border-border bg-background-card p-4 shadow-card"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
          {stat.hint && <p className="mt-1 text-xs text-text-muted">{stat.hint}</p>}
        </article>
      ))}
    </div>
  );
}

