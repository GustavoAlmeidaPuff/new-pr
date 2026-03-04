import { useState } from "react";
import { X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { createWorkout } from "../../services/workouts.service";

type CreateWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (workoutId: string) => void;
};

export function CreateWorkoutModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkoutModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const workoutId = await createWorkout({
        userId: user.uid,
        name: name.trim(),
      });
      setName("");
      onSuccess?.(workoutId);
      onClose();
    } catch (err) {
      console.error("Erro ao criar treino:", err);
      setError("Erro ao criar treino. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl bg-background-card p-6 shadow-xl">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Novo treino</h2>
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
            <label
              htmlFor="workout-name"
              className="mb-2 block text-sm font-medium text-text-muted"
            >
              Nome do treino
            </label>
            <input
              id="workout-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
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
              {loading ? "Criando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
