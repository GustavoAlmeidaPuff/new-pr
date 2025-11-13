import { useMemo } from "react";

import type { WorkoutExercisePreview } from "..";

type UseWorkoutDetailDataParams = {
  workoutId?: string;
};

export function useWorkoutDetailData({ workoutId }: UseWorkoutDetailDataParams) {
  // TODO: substituir dados mock por consulta ao Firestore filtrando pelo workoutId.
  const exercises = useMemo<WorkoutExercisePreview[]>(
    () => [
      {
        id: "supino-reto",
        name: "Supino Reto",
        muscleGroup: "Peito, Tríceps",
        lastPr: { weight: 22, reps: 6, date: "2024-12-06", trend: "up" },
      },
      {
        id: "desenvolvimento",
        name: "Desenvolvimento",
        muscleGroup: "Ombros",
        lastPr: { weight: 18, reps: 8, date: "2024-11-29", trend: "down" },
      },
      {
        id: "rosca-direta",
        name: "Rosca Direta",
        muscleGroup: "Bíceps",
        lastPr: { weight: 14, reps: 10, date: "2024-11-22", trend: "steady" },
      },
      {
        id: "triceps-testa",
        name: "Tríceps Testa",
        muscleGroup: "Tríceps",
        lastPr: { weight: 12, reps: 12, date: "2024-11-19", trend: "down" },
      },
    ],
    [workoutId],
  );

  return {
    exercises,
    loading: false,
    error: null as Error | null,
  };
}

