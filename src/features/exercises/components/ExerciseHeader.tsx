import { useMemo } from "react";

import type { ExerciseSummary } from "..";

type ExerciseHeaderProps = {
  exercise: ExerciseSummary;
};

export function ExerciseHeader({ exercise }: ExerciseHeaderProps) {
  const muscles = useMemo(() => exercise.muscles.join(", "), [exercise.muscles]);

  return (
    <header className="space-y-2">
      <div>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-xs font-medium uppercase tracking-wide text-primary transition hover:text-primary/80"
        >
          Voltar
        </button>
      </div>
      <div>
        <h1 className="text-3xl font-semibold text-white">{exercise.name}</h1>
        <p className="text-sm text-text-muted">{muscles}</p>
      </div>
    </header>
  );
}

