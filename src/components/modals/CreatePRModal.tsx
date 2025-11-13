import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

import { useAuth } from "../../contexts/AuthContext";
import { createPR } from "../../services/prs.service";
import { getActivePeriodization } from "../../services/periodizations.service";
import { firestore } from "../../config/firebase";

type CreatePRModalProps = {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
  onSuccess?: () => void;
};

export function CreatePRModal({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
  onSuccess,
}: CreatePRModalProps) {
  const { user } = useAuth();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodizationId, setPeriodizationId] = useState<string | null>(null);
  const [weightType, setWeightType] = useState<"total" | "per-side">("total");

  useEffect(() => {
    if (isOpen && user) {
      // Busca periodização ativa
      getActivePeriodization(user.uid).then((periodization) => {
        if (periodization) {
          setPeriodizationId(periodization.id);
        } else {
          setError("Nenhuma periodização ativa. Crie uma antes de registrar PRs.");
        }
      });

      // Busca tipo de carga do exercício
      const loadExerciseWeightType = async () => {
        try {
          const exercisesPath = `users/${user.uid}/exercises`;
          const exerciseRef = doc(firestore, exercisesPath, exerciseId);
          const exerciseSnap = await getDoc(exerciseRef);

          if (exerciseSnap.exists()) {
            const exerciseData = exerciseSnap.data();
            setWeightType(exerciseData.weightType || "total");
          }
        } catch (err) {
          console.error("Erro ao carregar tipo de carga:", err);
        }
      };

      loadExerciseWeightType();
    }
  }, [isOpen, user, exerciseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    if (!periodizationId) {
      setError("Nenhuma periodização ativa encontrada");
      return;
    }

    if (!weight || !reps) {
      setError("Peso e repetições são obrigatórios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPR({
        userId: user.uid,
        exerciseId,
        periodizationId,
        weight: parseFloat(weight),
        reps: parseInt(reps, 10),
        date,
        notes: notes.trim(),
      });

      setWeight("");
      setReps("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao criar PR:", err);
      setError("Erro ao registrar PR. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl bg-background-card p-6 shadow-xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Registrar PR</h2>
            <p className="text-sm text-text-muted">{exerciseName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted transition hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="mb-2 block text-sm font-medium text-text-muted">
                {weightType === "per-side" ? "Peso por lado (kg)" : "Peso (kg)"}
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              {weightType === "per-side" && (
                <p className="mt-1 text-xs text-text-muted">
                  Quanto tem de cada lado (ex: 20kg de cada lado na barra)
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reps" className="mb-2 block text-sm font-medium text-text-muted">
                Repetições
              </label>
              <input
                id="reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="mb-2 block text-sm font-medium text-text-muted">
              Data
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-text-muted">
              Observações (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Série pesada, sentiu dor, etc."
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
              disabled={loading || !periodizationId}
              className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

