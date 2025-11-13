import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

import { WorkoutExerciseCard } from "../../features/workouts/components/WorkoutExerciseCard";
import { useWorkoutDetailData } from "../../features/workouts/hooks/useWorkoutDetailData";
import { AddExerciseToWorkoutModal } from "../../components/modals/AddExerciseToWorkoutModal";
import { useAuth } from "../../contexts/AuthContext";
import { firestore } from "../../config/firebase";

export function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const { user } = useAuth();
  const { exercises, loading } = useWorkoutDetailData({ workoutId });
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Treino");

  useEffect(() => {
    if (!workoutId || !user) return;

    const loadWorkoutName = async () => {
      try {
        const workoutRef = doc(firestore, `users/${user.uid}/workouts/${workoutId}`);
        const workoutSnap = await getDoc(workoutRef);

        if (workoutSnap.exists()) {
          setWorkoutName(workoutSnap.data().name);
        }
      } catch (error) {
        console.error("Erro ao carregar nome do treino:", error);
      }
    };

    loadWorkoutName();
  }, [workoutId, user]);

  const handleAddExercise = () => {
    setIsAddModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Carregando exercícios...
      </div>
    );
  }

  return (
    <>
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
            <h1 className="mt-2 text-3xl font-semibold text-white">{workoutName}</h1>
            <p className="text-sm text-text-muted">
              {exercises.length} {exercises.length === 1 ? "exercício" : "exercícios"}
            </p>
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

        {exercises.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background-card/40 p-8 text-center">
            <p className="mb-4 text-lg font-medium text-text-muted">
              Nenhum exercício neste treino
            </p>
            <button
              type="button"
              onClick={handleAddExercise}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              Adicionar primeiro exercício
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {exercises.map((exercise) => (
              <WorkoutExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </section>

      {workoutId && (
        <AddExerciseToWorkoutModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          workoutId={workoutId}
          workoutName={workoutName}
        />
      )}
    </>
  );
}

