import { useState, useEffect } from "react";
import { Check, List, X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { updateExercise } from "../../services/exercises.service";
import { addExerciseToWorkout, getWorkoutIdsContainingExercise } from "../../services/workouts.service";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import type { WorkoutRecord } from "../../services/workouts.service";

type EditExerciseInput = {
  id: string;
  name: string;
  muscleGroup?: string;
  muscles?: string[];
  notes?: string;
  weightType?: "total" | "per-side";
};

type EditExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  exercise: EditExerciseInput | null;
};

const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Pernas",
  "Glúteos",
  "Core",
  "Antebraços",
];

export function EditExerciseModal({
  isOpen,
  onClose,
  onSuccess,
  exercise,
}: EditExerciseModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Peito");
  const [notes, setNotes] = useState("");
  const [weightType, setWeightType] = useState<"total" | "per-side">("total");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutIdsWithExercise, setWorkoutIdsWithExercise] = useState<string[]>([]);
  const [addingToWorkoutId, setAddingToWorkoutId] = useState<string | null>(null);

  const { data: workouts } = useFirestoreCollection<WorkoutRecord>({
    path: user ? `users/${user.uid}/workouts` : "users/__placeholder__/workouts",
    orderByField: "name",
    orderByDirection: "asc",
  });

  useEffect(() => {
    if (user && exercise && isOpen) {
      getWorkoutIdsContainingExercise(user.uid, exercise.id).then(setWorkoutIdsWithExercise);
    } else {
      setWorkoutIdsWithExercise([]);
    }
  }, [user, exercise?.id, isOpen]);

  const handleAddToWorkout = async (workoutId: string) => {
    if (!user || !exercise) return;
    setAddingToWorkoutId(workoutId);
    try {
      await addExerciseToWorkout(user.uid, workoutId, exercise.id);
      setWorkoutIdsWithExercise((prev) =>
        prev.includes(workoutId) ? prev : [...prev, workoutId]
      );
    } catch (err) {
      console.error("Erro ao adicionar ao treino:", err);
    } finally {
      setAddingToWorkoutId(null);
    }
  };

  useEffect(() => {
    if (exercise && isOpen) {
      setName(exercise.name || "");
      // Tenta pegar muscleGroup, ou o primeiro muscle da lista, ou fallback para "Peito"
      const defaultMuscleGroup = exercise.muscleGroup || 
                                 (exercise.muscles && exercise.muscles.length > 0 ? exercise.muscles[0] : "Peito");
      setMuscleGroup(defaultMuscleGroup);
      setNotes(exercise.notes || "");
      setWeightType(exercise.weightType || "total");
      setError(null);
    }
    
    // Reset quando fechar
    if (!isOpen) {
      setError(null);
      setLoading(false);
    }
  }, [exercise, isOpen]);

  if (!isOpen || !exercise) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (!muscleGroup) {
      setError("Grupo muscular é obrigatório");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateExercise(user.uid, exercise.id, {
        name: name.trim(),
        muscleGroup: muscleGroup,
        notes: notes.trim(),
        weightType: weightType,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar exercício:", err);
      setError("Erro ao atualizar exercício. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl bg-background-card p-6 shadow-xl">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Editar Exercício</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted transition hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-text-muted">
              Nome do Exercício
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Supino Reto"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label htmlFor="muscleGroup" className="mb-2 block text-sm font-medium text-text-muted">
              Grupo Muscular
            </label>
            <select
              id="muscleGroup"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="weightType" className="mb-2 block text-sm font-medium text-text-muted">
              Tipo de Carga
            </label>
            <select
              id="weightType"
              value={weightType}
              onChange={(e) => setWeightType(e.target.value as "total" | "per-side")}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="total">Carga Total (barra + anilhas)</option>
              <option value="per-side">Carga por Lado (halter, cabo)</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-text-muted">
              Observações
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Usar pegada pronada"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
              <List className="h-4 w-4" />
              Adicionar a um treino
            </div>
            {workouts.length === 0 ? (
              <p className="rounded-xl border border-border bg-background-elevated/50 px-4 py-3 text-sm text-text-muted">
                Crie um treino em Treinos para adicionar este exercício.
              </p>
            ) : (
              <ul className="space-y-2 max-h-40 overflow-y-auto rounded-xl border border-border bg-background-elevated/30 p-2">
                {workouts.map((w) => {
                  const isInWorkout = workoutIdsWithExercise.includes(w.id);
                  return (
                    <li
                      key={w.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-white">{w.name}</span>
                      {isInWorkout ? (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <Check className="h-4 w-4" />
                          No treino
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToWorkout(w.id)}
                          disabled={addingToWorkoutId === w.id}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                        >
                          {addingToWorkoutId === w.id ? "Adicionando..." : "Adicionar"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 font-medium text-text-muted transition hover:bg-background-card"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

