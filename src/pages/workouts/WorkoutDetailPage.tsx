import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { WorkoutExerciseCard } from "../../features/workouts/components/WorkoutExerciseCard";
import { useWorkoutDetailData } from "../../features/workouts/hooks/useWorkoutDetailData";

const workoutNameMap: Record<string, { title: string; subtitle: string }> = {
  "treino-a": { title: "Treino A", subtitle: "Upper Body" },
  "treino-b": { title: "Treino B", subtitle: "Lower Body" },
  "treino-c": { title: "Treino C", subtitle: "Push" },
  "treino-d": { title: "Treino D", subtitle: "Pull" },
};

export function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const { exercises, loading } = useWorkoutDetailData({ workoutId });
  const navigate = useNavigate();

  const details = useMemo(() => {
    if (!workoutId) {
      return { title: "Treino", subtitle: "Detalhes do treino" };
    }
    return workoutNameMap[workoutId] ?? {
      title: workoutId.replace(/-/g, " "),
      subtitle: "Personalizado",
    };
  }, [workoutId]);

  const handleAddExercise = () => {
    // TODO: abrir modal para adicionar exercício ao treino via Firestore.
    console.info("Adicionar exercício acionado");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Carregando exercícios...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-medium uppercase tracking-wide text-primary transition hover:text-primary/80"
          >
            Voltar
          </button>
          <h1 className="mt-2 text-3xl font-semibold text-white">{details.title}</h1>
          <p className="text-sm text-text-muted">{details.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleAddExercise}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Adicionar exercício
        </button>
      </header>

      <div className="grid gap-4">
        {exercises.map((exercise) => (
          <WorkoutExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </section>
  );
}

