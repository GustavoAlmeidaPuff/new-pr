import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { Workout } from "..";

type WorkoutCardProps = {
  workout: Workout;
};

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Link
      to={`/treinos/${workout.id}`}
      className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-background-card px-5 py-4 text-white shadow-card transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div>
        <h3 className="text-lg font-semibold">{workout.name}</h3>
        <p className="text-sm text-text-muted">{workout.description}</p>
        <p className="mt-2 text-xs text-text-muted">{workout.exerciseCount} exercícios</p>
      </div>
      <ArrowRight className="h-5 w-5 text-text-muted" />
    </Link>
  );
}

