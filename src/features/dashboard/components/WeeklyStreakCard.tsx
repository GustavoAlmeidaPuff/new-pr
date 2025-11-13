import type { DashboardWeeklyStreak } from "..";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

type WeeklyStreakCardProps = {
  streak: DashboardWeeklyStreak | null;
};

export function WeeklyStreakCard({ streak }: WeeklyStreakCardProps) {
  if (!streak) {
    return (
      <article className="space-y-4 rounded-3xl border border-border bg-background-card p-5">
        <header>
          <p className="text-xs font-medium text-metric-volume">Consistência semanal</p>
          <h2 className="text-xl font-semibold text-white">Sequência de PRs</h2>
        </header>
        <p className="text-sm text-text-muted">
          Registre seus PRs para acompanhar sua sequência de semanas com evolução de carga.
        </p>
      </article>
    );
  }

  const recentWeeks = streak.weeks.slice(-4);

  return (
    <article className="space-y-4 rounded-3xl border border-border bg-background-card p-5">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium text-metric-volume">Consistência semanal</p>
        <h2 className="text-xl font-semibold text-white">Sequência de PRs</h2>
        <p className="text-sm text-text-muted">
          Confira quantas semanas seguidas você registrou PRs e manteve o volume crescente.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#101B2A] p-4">
          <p className="text-xs font-medium uppercase text-text-muted/80">Streak atual</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {streak.currentPrStreak}
            <span className="ml-1 text-sm font-normal text-text-muted">sem</span>
          </p>
        </div>
        <div className="rounded-2xl bg-[#101B2A] p-4">
          <p className="text-xs font-medium uppercase text-text-muted/80">Recorde</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {streak.longestPrStreak}
            <span className="ml-1 text-sm font-normal text-text-muted">sem</span>
          </p>
        </div>
        <div className="rounded-2xl bg-[#101B2A] p-4">
          <p className="text-xs font-medium uppercase text-text-muted/80">Carga em alta</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {streak.currentLoadIncreaseStreak}
            <span className="ml-1 text-sm font-normal text-text-muted">sem</span>
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <p className="text-xs font-medium uppercase text-text-muted/80">Últimas semanas</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {recentWeeks.map((week) => {
            const prRegistered = week.prsCount > 0;
            const formattedRange = `${dateFormatter.format(new Date(week.weekStart))} - ${dateFormatter.format(new Date(week.weekEnd))}`;
            return (
              <div
                key={week.index}
                className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-[#0E1621] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{week.label}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      prRegistered
                        ? "bg-green-500/20 text-green-400"
                        : "bg-text-muted/10 text-text-muted"
                    }`}
                  >
                    {prRegistered ? "PR registrado" : "Sem PR"}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  <p>{formattedRange}</p>
                  <p>
                    Volume:{" "}
                    <span className="font-semibold text-white">
                      {week.volume.toLocaleString("pt-BR")} kg
                    </span>
                  </p>
                  <p>Registros: {week.prsCount}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}

