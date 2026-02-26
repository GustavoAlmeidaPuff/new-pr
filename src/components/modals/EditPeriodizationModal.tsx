import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { updatePeriodization } from "../../services/periodizations.service";
import type { Periodization } from "../../features/periodizations/types";

type EditPeriodizationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  periodization: Periodization | null;
};

export function EditPeriodizationModal({
  isOpen,
  onClose,
  onSuccess,
  periodization,
}: EditPeriodizationModalProps) {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("14");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (periodization) {
      setStartDate(periodization.startDate || new Date().toISOString().split("T")[0]);
      setDurationDays(periodization.durationDays.toString());
    }
  }, [periodization]);

  if (!isOpen || !periodization) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    const days = parseInt(durationDays, 10);
    if (Number.isNaN(days) || days < 1 || days > 365) {
      setError("Duração deve ser entre 1 e 365 dias");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePeriodization(user.uid, periodization.id, {
        ...(startDate?.trim() && { startDate: startDate.trim() }),
        durationDays: days,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar periodização:", err);
      setError("Erro ao atualizar periodização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl bg-background-card p-6 shadow-xl">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Duração — {periodization.name}
          </h2>
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
            <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-text-muted">
              Data de início
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="duration" className="mb-2 block text-sm font-medium text-text-muted">
              Duração (dias)
            </label>
            <input
              id="duration"
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min={1}
              max={365}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
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

