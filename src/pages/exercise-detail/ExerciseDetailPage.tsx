import { useState } from "react";
import { useParams } from "react-router-dom";

import { CurrentPRCard } from "../../features/exercises/components/CurrentPRCard";
import { ExerciseHeader } from "../../features/exercises/components/ExerciseHeader";
import { ExerciseInsightsCard } from "../../features/exercises/components/ExerciseInsightsCard";
import { ExerciseTrendChart } from "../../features/exercises/components/ExerciseTrendChart";
import { PRHistoryList } from "../../features/exercises/components/PRHistoryList";
import { useExerciseDetailData } from "../../features/exercises/hooks/useExerciseDetailData";
import { CreatePRModal } from "../../components/modals/CreatePRModal";

export function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const { exercise, loading } = useExerciseDetailData({ exerciseId });
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);

  const handleRegisterPr = () => {
    setIsPRModalOpen(true);
  };

  if (loading || !exercise) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Carregando exercício...
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
          <PRHistoryList history={exercise.history} />
          <ExerciseInsightsCard insights={exercise.insights} />
        </div>
      </section>

      {exerciseId && (
        <CreatePRModal
          isOpen={isPRModalOpen}
          onClose={() => setIsPRModalOpen(false)}
          exerciseId={exerciseId}
          exerciseName={exercise.name}
        />
      )}
    </>
  );
}

