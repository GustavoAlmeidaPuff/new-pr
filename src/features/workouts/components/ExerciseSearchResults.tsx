import { ArrowUpRight, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

import type { WorkoutExercisePreview } from "..";

type ExerciseSearchResultsProps = {
  results: WorkoutExercisePreview[];
};

const trendIcons: Record<Required<WorkoutExercisePreview["lastPr"]>["trend"], string> = {
  up: "text-primary",
  down: "text-danger",
  steady: "text-text-muted",
};

export function ExerciseSearchResults({ results }: ExerciseSearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-3xl border border-border bg-background-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Resultados</p>
      <div className="space-y-3">
        {results.map((exercise) => {
          const trend = exercise.lastPr?.trend ?? "steady";
          return (
            <Link
              key={exercise.id}
              to={`/exercicios/${exercise.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-background-elevated/40 px-4 py-3 text-sm text-white transition hover:border-primary/40 hover:bg-primary/10"
            >
              <div className="flex flex-col">
                <span className="font-medium">{exercise.name}</span>
                <span className="text-xs text-text-muted">{exercise.muscleGroup}</span>
              </div>
              {exercise.lastPr && (
                <div className="flex items-center gap-2 text-xs">
                  <Dumbbell className={`h-4 w-4 ${trendIcons[trend]}`} />
                  <span className="font-semibold">
                    {exercise.lastPr.weight} kg × {exercise.lastPr.reps}
                  </span>
                  <span className="text-text-muted">
                    {new Date(exercise.lastPr.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
              <ArrowUpRight className="h-4 w-4 text-text-muted" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

