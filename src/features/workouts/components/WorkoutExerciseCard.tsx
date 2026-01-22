import { ArrowRight, GripVertical, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { WorkoutExercisePreview } from "..";
import type { WorkoutExerciseWithId } from "../hooks/useWorkoutDetailData";
import { formatWeight } from "../../exercises/utils/formatWeight";

type WorkoutExerciseCardProps = {
  exercise: WorkoutExercisePreview | WorkoutExerciseWithId;
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-3xl border border-border bg-background-card shadow-card"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-center p-2 text-text-muted transition hover:text-white active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <Link
        to={`/exercicios/${exercise.id}`}
        className="flex flex-1 items-center justify-between gap-4 px-2 py-4 text-white transition hover:border-primary/40 hover:bg-primary/5"
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
    </div>
  );
}

