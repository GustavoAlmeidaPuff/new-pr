import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { ExerciseSummary } from "..";

type ExerciseHeaderProps = {
  exercise: ExerciseSummary;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ExerciseHeader({ exercise, onEdit, onDelete }: ExerciseHeaderProps) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{exercise.name}</h1>
          <p className="text-sm text-text-muted">{muscles}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-border p-2 text-text-muted transition hover:border-primary hover:text-primary"
            title="Editar exercício"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-border p-2 text-text-muted transition hover:border-red-500 hover:text-red-500"
            title="Deletar exercício"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

