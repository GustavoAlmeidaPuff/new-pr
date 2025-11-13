import { useMemo } from "react";

import type { ExerciseSummary } from "..";

type UseExerciseDetailDataParams = {
  exerciseId?: string;
};

const fallbackExercise: ExerciseSummary = {
  id: "supino-reto",
  name: "Supino Reto",
  muscles: ["Peito", "Tríceps"],
  currentPr: {
    weight: 22,
    reps: 6,
    volume: 132,
    date: "2024-12-06",
    periodization: "Base",
  },
  insights: [
    "Você está em uma tendência positiva! Mantenha o ritmo.",
    "Seu progresso de carga está 15% acima da média.",
    "Considere aumentar as repetições antes de subir a carga.",
  ],
  trendSeries: [
    { date: "2024-11-01", weight: 18 },
    { date: "2024-11-08", weight: 20 },
    { date: "2024-11-15", weight: 20 },
    { date: "2024-11-22", weight: 21 },
    { date: "2024-11-29", weight: 22 },
    { date: "2024-12-06", weight: 22 },
  ],
  history: [
    {
      id: "pr-1",
      weight: 22,
      reps: 6,
      volume: 132,
      date: "2024-12-06",
      periodization: "Base",
      trend: "up",
    },
    {
      id: "pr-2",
      weight: 22,
      reps: 5,
      volume: 110,
      date: "2024-11-29",
      periodization: "Base",
      trend: "up",
    },
    {
      id: "pr-3",
      weight: 20,
      reps: 6,
      volume: 120,
      date: "2024-11-22",
      periodization: "Base",
      trend: "up",
    },
    {
      id: "pr-4",
      weight: 20,
      reps: 5,
      volume: 100,
      date: "2024-11-15",
      periodization: "Base",
      trend: "steady",
    },
  ],
};

export function useExerciseDetailData({ exerciseId }: UseExerciseDetailDataParams) {
  const exercise = useMemo<ExerciseSummary>(() => {
    if (!exerciseId) {
      return fallbackExercise;
    }

    // TODO: substituir por busca real no Firestore com base no exerciseId.
    return {
      ...fallbackExercise,
      id: exerciseId,
      name: exerciseId
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    };
  }, [exerciseId]);

  return {
    exercise,
    loading: false,
    error: null as Error | null,
  };
}

