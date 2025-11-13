import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "../../components/loading";
import { AddExerciseToWorkoutModal } from "../../components/modals/AddExerciseToWorkoutModal";
import { useAuth } from "../../contexts/AuthContext";
import { WorkoutExerciseCard } from "../../features/workouts/components/WorkoutExerciseCard";
import { WorkoutSearchInput } from "../../features/workouts/components/WorkoutSearchInput";
import { useWorkoutDetailData } from "../../features/workouts/hooks/useWorkoutDetailData";
import { getWorkoutById, type WorkoutRecord } from "../../services/workouts.service";

export function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const { user } = useAuth();
  const { exercises, loading, refresh } = useWorkoutDetailData({ workoutId });
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("Treino");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!workoutId || !user) return;

    const loadWorkoutName = async () => {
      try {
        const workout = await getWorkoutById<WorkoutRecord>(user.uid, workoutId);

        if (workout) {
          setWorkoutName(workout.name);
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

  const filteredExercises = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (normalizedTerm.length === 0) {
      return exercises;
    }

    return exercises.filter((exercise) => {
      const nameMatch = exercise.name.toLowerCase().includes(normalizedTerm);
      const muscleGroupMatch = exercise.muscleGroup
        ? exercise.muscleGroup.toLowerCase().includes(normalizedTerm)
        : false;

      return nameMatch || muscleGroupMatch;
    });
  }, [exercises, searchTerm]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-9 w-48 rounded-full" />
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-3xl" />
          ))}
        </div>
      </section>
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
          <div className="space-y-4">
            <WorkoutSearchInput value={searchTerm} onChange={setSearchTerm} />

            {filteredExercises.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-background-card/40 p-6 text-center text-sm text-text-muted">
                Nenhum exercício encontrado para &ldquo;{searchTerm}&rdquo;.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredExercises.map((exercise) => (
                  <WorkoutExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {workoutId && (
        <AddExerciseToWorkoutModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          workoutId={workoutId}
          workoutName={workoutName}
          onSuccess={refresh}
        />
      )}
    </>
  );
}

