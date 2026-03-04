import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "../../components/loading";
import { AddExerciseToWorkoutModal } from "../../components/modals/AddExerciseToWorkoutModal";
import { removeExerciseFromWorkout } from "../../services/workouts.service";
import { useTreinoDetailData } from "../../features/treinos/hooks/useTreinoDetailData";

export function TreinoDetailPage() {
  const { workoutId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { workout, exercises, loading, refresh } = useTreinoDetailData(workoutId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (exerciseId: string) => {
    if (!user || !workoutId) return;
    if (!window.confirm("Remover este exercício do treino?")) return;
    setRemovingId(exerciseId);
    try {
      await removeExerciseFromWorkout(user.uid, workoutId, exerciseId);
      refresh();
    } catch (err) {
      console.error("Erro ao remover exercício:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!workout) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-text-muted">
        Treino não encontrado.
      </div>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <header className="space-y-3">
          <button
            type="button"
            onClick={() => navigate("/treinos")}
            className="flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos treinos
          </button>
          <h1 className="text-3xl font-semibold text-white">{workout.name}</h1>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            {exercises.length === 0
              ? "Nenhum exercício no treino"
              : `${exercises.length} exercício${exercises.length !== 1 ? "s" : ""}`}
          </h2>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <Plus className="h-4 w-4" />
            Adicionar exercício
          </button>
        </div>

        <ul className="space-y-2">
          {exercises.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border bg-background-elevated/30 py-8 text-center text-sm text-text-muted">
              Adicione exercícios pelo botão acima ou ao editar um exercício em Exercícios.
            </li>
          ) : (
            exercises.map((item) => (
              <li
                key={item.workoutExerciseId}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background-card p-4"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/exercicios/${item.exerciseId}`)}
                  className="min-w-0 flex-1 text-left font-medium text-white transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background rounded-lg py-1"
                >
                  {item.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.exerciseId)}
                  disabled={removingId === item.exerciseId}
                  className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                  aria-label={`Remover ${item.name} do treino`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <AddExerciseToWorkoutModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        workoutId={workoutId!}
        workoutName={workout.name}
        exerciseIdsInWorkout={exercises.map((e) => e.exerciseId)}
        onSuccess={refresh}
      />
    </>
  );
}
