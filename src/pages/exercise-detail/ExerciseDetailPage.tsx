import { useState } from "react";
import { useParams } from "react-router-dom";

import { Skeleton } from "../../components/loading";
import { CreatePRModal } from "../../components/modals/CreatePRModal";
import { CurrentPRCard } from "../../features/exercises/components/CurrentPRCard";
import { ExerciseHeader } from "../../features/exercises/components/ExerciseHeader";
import { ExerciseInsightsCard } from "../../features/exercises/components/ExerciseInsightsCard";
import { ExerciseTrendChart } from "../../features/exercises/components/ExerciseTrendChart";
import { PRHistoryList } from "../../features/exercises/components/PRHistoryList";
import { useExerciseDetailData } from "../../features/exercises/hooks/useExerciseDetailData";

export function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const { exercise, loading, refresh } = useExerciseDetailData({ exerciseId });
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);

  const handleRegisterPr = () => {
    setIsPRModalOpen(true);
  };

  const handlePRSuccess = () => {
    refresh();
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="space-y-4 rounded-3xl border border-border bg-background-card/40 p-6">
          <Skeleton className="h-8 w-40 rounded-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </section>
    );
  }

  if (!exercise) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Exercício não encontrado.
      </div>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <ExerciseHeader exercise={exercise} />

        <CurrentPRCard exercise={exercise} onRegister={handleRegisterPr} />

        <ExerciseTrendChart exercise={exercise} />

        <div className="grid gap-4 lg:grid-cols-2">
          <PRHistoryList history={exercise.history} weightType={exercise.weightType} />
          <ExerciseInsightsCard insights={exercise.insights} />
        </div>
      </section>

      {exerciseId && (
        <CreatePRModal
          isOpen={isPRModalOpen}
          onClose={() => setIsPRModalOpen(false)}
          exerciseId={exerciseId}
          exerciseName={exercise.name}
          onSuccess={handlePRSuccess}
        />
      )}
    </>
  );
}

