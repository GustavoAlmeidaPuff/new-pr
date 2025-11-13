import { useState, useEffect } from "react";
import { X, Plus, Search } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { addExerciseToWorkout } from "../../services/workouts.service";
import { searchExercisesByName } from "../../services/exercises.service";
import { CreateExerciseModal } from "./CreateExerciseModal";

type AddExerciseToWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  workoutName: string;
  onSuccess?: () => void;
};

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
};

export function AddExerciseToWorkoutModal({
  isOpen,
  onClose,
  workoutId,
  workoutName,
  onSuccess,
}: AddExerciseToWorkoutModalProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) {
      setExercises([]);
      setSearchTerm("");
      return;
    }

    const loadExercises = async () => {
      setIsSearching(true);
      try {
        const results = await searchExercisesByName(user.uid, searchTerm || "");
        setExercises(results);
      } catch (err) {
        console.error("Erro ao buscar exercícios:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(loadExercises, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen, user]);

  if (!isOpen) return null;

  const handleAddExercise = async (exerciseId: string) => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addExerciseToWorkout({
        userId: user.uid,
        workoutId,
        exerciseId,
        order: Date.now(), // Usa timestamp como ordem temporária
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar exercício:", err);
      setError("Erro ao adicionar exercício. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewExercise = () => {
    setIsCreateModalOpen(true);
  };

  const handleExerciseCreated = async (exerciseId: string) => {
    setIsCreateModalOpen(false);
    // Adiciona automaticamente o exercício criado ao treino
    await handleAddExercise(exerciseId);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-md rounded-3xl bg-background-card p-6 shadow-xl">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Adicionar Exercício</h2>
              <p className="text-sm text-text-muted">{workoutName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-text-muted transition hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </header>

          {/* Campo de busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar exercícios..."
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Botão criar novo exercício */}
          <button
            type="button"
            onClick={handleCreateNewExercise}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm font-medium text-text-muted transition hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Criar novo exercício
          </button>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
          )}

          {/* Lista de exercícios */}
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {isSearching ? (
              <div className="py-8 text-center text-sm text-text-muted">Buscando...</div>
            ) : exercises.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-muted">
                {searchTerm
                  ? "Nenhum exercício encontrado"
                  : "Crie seu primeiro exercício para começar"}
              </div>
            ) : (
              exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => handleAddExercise(exercise.id)}
                  disabled={loading}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary hover:bg-background-card disabled:opacity-50"
                >
                  <div>
                    <h3 className="font-semibold text-white">{exercise.name}</h3>
                    <p className="text-xs text-text-muted">{exercise.muscleGroup}</p>
                  </div>
                  <Plus className="h-5 w-5 text-primary" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de criar exercício */}
      <CreateExerciseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleExerciseCreated}
      />
    </>
  );
}

