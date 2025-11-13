import { Trophy } from "lucide-react";

import type { ExerciseSummary } from "..";
import { formatWeight } from "../utils/formatWeight";

type CurrentPRCardProps = {
  exercise: ExerciseSummary;
  onRegister: () => void;
};

export function CurrentPRCard({ exercise, onRegister }: CurrentPRCardProps) {
  const pr = exercise.currentPr;

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background-card to-background-muted shadow-card">
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-primary">PR Atual</span>
            <h2 className="text-xl font-semibold text-white">{exercise.name}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          + Registrar novo PR
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 py-6 text-center">
        <div className="rounded-2xl border border-metric-load/30 bg-metric-load/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-metric-load">Carga</p>
          <p className="mt-1 text-lg font-semibold text-metric-load">
            {formatWeight(pr.weight, exercise.weightType)}
          </p>
        </div>
        <div className="rounded-2xl border border-metric-reps/30 bg-metric-reps/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-metric-reps">Repetições</p>
          <p className="mt-1 text-lg font-semibold text-metric-reps">{pr.reps}</p>
        </div>
        <div className="rounded-2xl border border-metric-volume/30 bg-metric-volume/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-metric-volume">Volume</p>
          <p className="mt-1 text-lg font-semibold text-metric-volume">
            {formatWeight(pr.volume, exercise.weightType)}
          </p>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-border/60 bg-background-elevated/40 px-5 py-4 text-xs text-text-muted">
        <span>
          Registrado em{" "}
          <strong className="font-semibold text-white">
            {new Date(pr.date).toLocaleDateString("pt-BR")}
          </strong>
        </span>
        <span>
          Periodização{" "}
          <strong className="font-semibold text-white">{pr.periodization}</strong>
        </span>
      </footer>
    </article>
  );
}

