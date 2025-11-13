import { Lightbulb } from "lucide-react";

type ExerciseInsightsCardProps = {
  insights: string[];
};

export function ExerciseInsightsCard({ insights }: ExerciseInsightsCardProps) {
  if (!insights.length) {
    return null;
  }

  return (
    <article className="space-y-4 rounded-3xl border border-success/40 bg-success/10 p-5 text-success-foreground shadow-card">
      <header className="flex items-center gap-3 text-success">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">Insights</p>
          <h2 className="text-lg font-semibold">Recomendações</h2>
        </div>
      </header>
      <ul className="space-y-2 text-sm">
        {insights.map((insight, index) => (
          <li
            key={`${insight}-${index}`}
            className="rounded-2xl border border-success/30 bg-success/20 px-3 py-2 text-success-foreground/90"
          >
            {insight}
          </li>
        ))}
      </ul>
    </article>
  );
}

