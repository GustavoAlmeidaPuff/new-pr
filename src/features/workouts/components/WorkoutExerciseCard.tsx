import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import type { WorkoutExercisePreview } from "..";
import { formatWeight } from "../../exercises/utils/formatWeight";

type WorkoutExerciseCardProps = {
  exercise: WorkoutExercisePreview;
};

const trendStyles: Record<"up" | "down" | "steady", string> = {
  up: "text-primary",
  down: "text-danger",
  steady: "text-text-muted",
};

const trendIcons: Record<
  "up" | "down" | "steady",
  React.ComponentType<{ className?: string }>
> = {
  up: TrendingUp,
  down: TrendingDown,
  steady: Minus,
};

export function WorkoutExerciseCard({ exercise }: WorkoutExerciseCardProps) {
  const trend = exercise.lastPr?.trend ?? "steady";
  const TrendIcon = trendIcons[trend];

  return (
    <Link
      to={`/exercicios/${exercise.id}`}
      className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-background-card px-5 py-4 text-white shadow-card transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold capitalize">{exercise.name}</h3>
        <p className="text-sm text-text-muted">{exercise.muscleGroup}</p>
        {exercise.lastPr ? (
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
            <TrendIcon className={`h-4 w-4 ${trendStyles[trend]}`} />
            Último PR:
            <span className="text-metric-load">
              {formatWeight(exercise.lastPr.weight, exercise.weightType)}
            </span>
            <span className="text-metric-reps">× {exercise.lastPr.reps} reps</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-text-muted">Ainda sem PR registrado</p>
        )}
      </div>
      <ArrowRight className="h-5 w-5 text-text-muted" />
    </Link>
  );
}

