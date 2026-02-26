import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { PRWithExerciseInfo } from "../../../services/prs.service";
import { formatWeight } from "../utils/formatWeight";

export type ExerciseListItemData = {
  id: string;
  name: string;
  muscleGroup: string;
  weightType?: "total" | "per-side";
};

type ExerciseListItemProps = {
  exercise: ExerciseListItemData;
  lastPR?: PRWithExerciseInfo | null;
};

export function ExerciseListItem({ exercise, lastPR }: ExerciseListItemProps) {
  return (
    <Link
      to={`/exercicios/${exercise.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-background-elevated/40 px-4 py-3 text-left text-sm text-white transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium truncate">{exercise.name}</span>
        <span className="text-xs text-text-muted">{exercise.muscleGroup}</span>
        {lastPR && (
          <span className="text-xs text-text-muted">
            Último PR:{" "}
            <span className="text-metric-load">{formatWeight(lastPR.weight, exercise.weightType)}</span>
            {" × "}
            <span className="text-metric-reps">{lastPR.reps} reps</span>
          </span>
        )}
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
    </Link>
  );
}
