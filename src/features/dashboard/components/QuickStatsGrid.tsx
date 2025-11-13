import type { DashboardQuickStat } from "..";

type QuickStatsGridProps = {
  stats: DashboardQuickStat[];
};

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  const getAccentClass = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes("carga") || normalized.includes("peso")) {
      return "text-metric-load";
    }
    if (normalized.includes("repet")) {
      return "text-metric-reps";
    }
    if (normalized.includes("volume")) {
      return "text-metric-volume";
    }
    return "text-white";
  };

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
          <p className={`mt-2 text-2xl font-semibold ${getAccentClass(stat.label)}`}>
            {stat.value}
          </p>
          {stat.hint && <p className="mt-1 text-xs text-text-muted">{stat.hint}</p>}
        </article>
      ))}
    </div>
  );
}

