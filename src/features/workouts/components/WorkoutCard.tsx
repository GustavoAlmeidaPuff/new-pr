import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Workout } from "..";

type WorkoutCardProps = {
  workout: Workout;
  onEdit?: (workout: Workout) => void;
  onDelete?: (id: string) => void;
};

export function WorkoutCard({ workout, onEdit, onDelete }: WorkoutCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/treinos/${workout.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(workout);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(workout.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl border border-border bg-background-card px-5 py-4 text-white shadow-card transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{workout.name}</h3>
        <p className="text-sm text-text-muted">{workout.description}</p>
        <p className="mt-2 text-xs text-text-muted">{workout.exerciseCount} exercícios</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleEditClick}
          className="rounded-full border border-border p-2 text-text-muted transition hover:border-primary hover:text-primary"
          title="Editar treino"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="rounded-full border border-border p-2 text-text-muted transition hover:border-red-500 hover:text-red-500"
          title="Deletar treino"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <ArrowRight className="h-5 w-5 text-text-muted" />
      </div>
    </div>
  );
}

