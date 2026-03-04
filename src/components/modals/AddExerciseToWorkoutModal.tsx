import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { addExerciseToWorkout } from "../../services/workouts.service";
import type { ExerciseRecord } from "../../services/exercises.service";

type AddExerciseToWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  workoutName: string;
  exerciseIdsInWorkout: string[];
  onSuccess?: () => void;
};

function normalizeSearch(value: string): string {
  return value.toLowerCase().trim().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function AddExerciseToWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  workoutName,
  exerciseIdsInWorkout,
  onSuccess,
}: AddExerciseToWorkoutModalProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data: allExercises } = useFirestoreCollection<
    Pick<ExerciseRecord, "id" | "name" | "muscleGroup">
  >({
    path: user ? `users/${user.uid}/exercises` : "users/__placeholder__/exercises",
    orderByField: "name",
    orderByDirection: "asc",
  });

  const inWorkoutSet = useMemo(
    () => new Set(exerciseIdsInWorkout),
    [exerciseIdsInWorkout]
  );

  const available = useMemo(
    () => allExercises.filter((e) => !inWorkoutSet.has(e.id)),
    [allExercises, inWorkoutSet]
  );

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return available;
    const term = normalizeSearch(searchTerm);
    return available.filter(
      (e) =>
        normalizeSearch(e.name).includes(term) ||
        normalizeSearch(e.muscleGroup ?? "").includes(term)
    );
  }, [available, searchTerm]);

  const handleAdd = async (exerciseId: string) => {
    if (!user) return;
    setAddingId(exerciseId);
    try {
      await addExerciseToWorkout(user.uid, workoutId, exerciseId);
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao adicionar exercício ao treino:", err);
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl bg-background-card shadow-xl">
        <header className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-white">
            Adicionar exercício — {workoutName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="shrink-0 p-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar exercício..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Buscar exercício"
            />
          </div>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto p-3 pt-0 space-y-1">
          {filtered.length === 0 ? (
            <li className="py-6 text-center text-sm text-text-muted">
              {available.length === 0
                ? "Todos os exercícios já estão neste treino."
                : "Nenhum exercício encontrado."}
            </li>
          ) : (
            filtered.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => handleAdd(ex.id)}
                  disabled={addingId === ex.id}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background-elevated px-4 py-3 text-left transition hover:border-primary/40 disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-white">{ex.name}</span>
                    {ex.muscleGroup && (
                      <span className="ml-2 text-xs text-text-muted">{ex.muscleGroup}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-primary">
                    {addingId === ex.id ? "Adicionando..." : "Adicionar"}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
