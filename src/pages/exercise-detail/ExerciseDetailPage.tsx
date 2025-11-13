import { useState } from "react";
import { useParams } from "react-router-dom";

import { CurrentPRCard } from "../../features/exercises/components/CurrentPRCard";
import { ExerciseHeader } from "../../features/exercises/components/ExerciseHeader";
import { ExerciseInsightsCard } from "../../features/exercises/components/ExerciseInsightsCard";
import { ExerciseTrendChart } from "../../features/exercises/components/ExerciseTrendChart";
import { PRHistoryList } from "../../features/exercises/components/PRHistoryList";
import { useExerciseDetailData } from "../../features/exercises/hooks/useExerciseDetailData";

export function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const { exercise, loading } = useExerciseDetailData({ exerciseId });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterPr = () => {
    setIsRegistering(true);
    // TODO: abrir modal para registrar PR via Firestore.
    console.info("Registrar PR acionado");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Carregando exercício...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <ExerciseHeader exercise={exercise} />

      <CurrentPRCard exercise={exercise} onRegister={handleRegisterPr} />

      <ExerciseTrendChart exercise={exercise} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PRHistoryList history={exercise.history} />
        <ExerciseInsightsCard insights={exercise.insights} />
      </div>

      {isRegistering && (
        <div className="rounded-3xl border border-border bg-background-card p-5 text-sm text-text-muted">
          Formulário de registro de PR será implementado em breve.
        </div>
      )}
    </section>
  );
}

