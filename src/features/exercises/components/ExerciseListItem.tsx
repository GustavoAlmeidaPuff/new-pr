import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export type ExerciseListItemData = {
  id: string;
  name: string;
  muscleGroup: string;
  weightType?: "total" | "per-side";
};

type ExerciseListItemProps = {
  exercise: ExerciseListItemData;
};

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
  return (
    <Link
      to={`/exercicios/${exercise.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-background-elevated/40 px-4 py-3 text-left text-sm text-white transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{exercise.name}</span>
        <span className="text-xs text-text-muted">{exercise.muscleGroup}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
    </Link>
  );
}
