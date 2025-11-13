import { ArrowUpRight, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

import { Skeleton } from "../../../components/loading";
import type { WorkoutExercisePreview } from "..";
import { formatWeight } from "../../exercises/utils/formatWeight";

type ExerciseSearchResultsProps = {
  results: WorkoutExercisePreview[];
  isLoading?: boolean;
};

const trendIcons: Record<"up" | "down" | "steady", string> = {
  up: "text-primary",
  down: "text-danger",
  steady: "text-text-muted",
};

export function ExerciseSearchResults({ results, isLoading = false }: ExerciseSearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-3xl border border-border bg-background-card p-4">
        <Skeleton className="h-4 w-24 rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-background-elevated/40 px-4 py-3"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
                {exercise.workoutNames && exercise.workoutNames.length > 0 && (
                  <span className="text-xs text-text-muted">
                    {exercise.workoutNames.length === 1 ? "Treino: " : "Treinos: "}
                    {exercise.workoutNames.join(" · ")}
                  </span>
                )}
              </div>
              {exercise.lastPr && (
                <div className="flex items-center gap-2 text-xs">
                  <Dumbbell className={`h-4 w-4 ${trendIcons[trend]}`} />
                  <span className="font-semibold">
                    {formatWeight(exercise.lastPr.weight, exercise.weightType)} × {exercise.lastPr.reps}
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

