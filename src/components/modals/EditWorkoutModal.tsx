import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { updateWorkout, type WorkoutRecord } from "../../services/workouts.service";

type EditWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  workout: WorkoutRecord | null;
};

export function EditWorkoutModal({
  isOpen,
  onClose,
  onSuccess,
  workout,
}: EditWorkoutModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workout) {
      setName(workout.name);
      setDescription(workout.description || "");
    }
  }, [workout]);

  if (!isOpen || !workout) return null;

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

    setLoading(true);
    setError(null);

    try {
      await updateWorkout(user.uid, workout.id, {
        name: name.trim(),
        description: description.trim(),
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar treino:", err);
      setError("Erro ao atualizar treino. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl bg-background-card p-6 shadow-xl">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Editar Treino</h2>
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
              Nome do Treino
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A - Upper"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-text-muted">
              Descrição
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Peito, Ombros, Tríceps"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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

