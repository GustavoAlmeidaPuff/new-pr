import type { DashboardPRHistoryItem } from "..";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type PRHistoryTimelineProps = {
  items: DashboardPRHistoryItem[];
};

function groupByDate(items: DashboardPRHistoryItem[]) {
  return items.reduce<Record<string, DashboardPRHistoryItem[]>>((acc, item) => {
    const formattedDate = dateFormatter.format(new Date(item.date));
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push(item);
    return acc;
  }, {});
}

export function PRHistoryTimeline({ items }: PRHistoryTimelineProps) {
  if (items.length === 0) {
    return (
      <article className="space-y-4 rounded-3xl border border-border bg-background-card p-5">
        <header>
          <p className="text-xs font-medium text-metric-volume">Histórico de PRs</p>
          <h2 className="text-xl font-semibold text-white">Linha do tempo</h2>
        </header>
        <p className="text-sm text-text-muted">
          Assim que você registrar novos PRs, eles aparecerão por aqui com detalhes completos.
        </p>
      </article>
    );
  }

  const grouped = groupByDate(items);
  const orderedDates = Object.keys(grouped).sort((a, b) => {
    const dateA = new Date(grouped[a][0].date).getTime();
    const dateB = new Date(grouped[b][0].date).getTime();
    return dateB - dateA;
  });

  return (
    <article className="space-y-4 rounded-3xl border border-border bg-background-card p-5">
      <header>
        <p className="text-xs font-medium text-metric-volume">Histórico de PRs</p>
        <h2 className="text-xl font-semibold text-white">Linha do tempo</h2>
        <p className="mt-1 text-sm text-text-muted">
          Acompanhe todos os PRs registrados e veja sua evolução ao longo dos dias.
        </p>
      </header>

      <div className="space-y-5">
        {orderedDates.map((dateLabel) => (
          <section key={dateLabel} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#7B5CFF] to-[#5CE1FF]" />
              <h3 className="text-sm font-semibold text-white">{dateLabel}</h3>
            </div>
            <ol className="space-y-3 pl-9">
              {grouped[dateLabel]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-border/60 bg-[#0E1621] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.exerciseName}
                        </p>
                        <p className="text-xs text-text-muted">
                          Volume:{" "}
                          <span className="font-semibold text-white">
                            {item.volume.toLocaleString("pt-BR")} kg
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-3 text-xs text-text-muted sm:text-sm">
                        <span className="rounded-full bg-text-muted/10 px-3 py-1">
                          Peso:{" "}
                          <span className="font-semibold text-white">
                            {item.weight.toLocaleString("pt-BR")} kg
                          </span>
                        </span>
                        <span className="rounded-full bg-text-muted/10 px-3 py-1">
                          Reps:{" "}
                          <span className="font-semibold text-white">
                            {item.reps}
                          </span>
                        </span>
                      </div>
                    </div>
                    {item.notes && item.notes.trim().length > 0 ? (
                      <p className="mt-2 text-xs text-text-muted">
                        Observações: {item.notes}
                      </p>
                    ) : null}
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </article>
  );
}

