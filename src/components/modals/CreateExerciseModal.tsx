import { useState } from "react";
import { X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { createExercise } from "../../services/exercises.service";

type CreateExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (exerciseId: string) => void;
};

const muscleGroups = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Pernas",
  "Quadríceps",
  "Posteriores",
  "Glúteos",
  "Panturrilhas",
  "Abdômen",
  "Core",
];

export function CreateExerciseModal({ isOpen, onClose, onSuccess }: CreateExerciseModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [notes, setNotes] = useState("");
  const [weightType, setWeightType] = useState<"total" | "per-side">("total");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    if (!name.trim() || !muscleGroup) {
      setError("Nome e grupo muscular são obrigatórios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const exerciseId = await createExercise({
        userId: user.uid,
        name: name.trim(),
        muscleGroup,
        notes: notes.trim(),
        weightType,
      });

      setName("");
      setMuscleGroup("");
      setNotes("");
      setWeightType("total");
      onSuccess?.(exerciseId);
      onClose();
    } catch (err) {
      console.error("Erro ao criar exercício:", err);
      setError("Erro ao criar exercício. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl bg-background-card p-6 shadow-xl">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Novo Exercício</h2>
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
              required
            >
              <option value="">Selecione um grupo</option>
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="weightType" className="mb-2 block text-sm font-medium text-metric-load">
              Tipo de Carga
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary">
                <input
                  type="radio"
                  name="weightType"
                  value="total"
                  checked={weightType === "total"}
                  onChange={(e) => setWeightType(e.target.value as "total")}
                  className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-metric-load">Carga Total</div>
                  <div className="text-xs text-text-muted">
                    Ex: Máquina de polias, Cadeira Extensora (peso total do aparelho)
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary">
                <input
                  type="radio"
                  name="weightType"
                  value="per-side"
                  checked={weightType === "per-side"}
                  onChange={(e) => setWeightType(e.target.value as "per-side")}
                  className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-metric-load">Carga por Lado</div>
                  <div className="text-xs text-text-muted">
                    Ex: Barra (20kg cada lado), halteres, cabos unilaterais
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-text-muted">
              Observações (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Com barra, no smith, etc."
              rows={2}
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
              {loading ? "Criando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

