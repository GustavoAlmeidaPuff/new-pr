import { useMemo, useState } from "react";

import type { Workout, WorkoutExercisePreview } from "..";

type UseWorkoutsDataReturn = {
  workouts: Workout[];
  exercises: WorkoutExercisePreview[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

const workoutsSeed: Workout[] = [
  { id: "treino-a", name: "Treino A", description: "Upper Body", exerciseCount: 8 },
  { id: "treino-b", name: "Treino B", description: "Lower Body", exerciseCount: 7 },
  { id: "treino-c", name: "Treino C", description: "Push", exerciseCount: 6 },
  { id: "treino-d", name: "Treino D", description: "Pull", exerciseCount: 7 },
];

const exercisesSeed: WorkoutExercisePreview[] = [
  {
    id: "supino-reto",
    name: "Supino Reto",
    muscleGroup: "Peito",
    lastPr: { weight: 22, reps: 6, date: "2024-12-06", trend: "up" },
  },
  {
    id: "agachamento",
    name: "Agachamento Livre",
    muscleGroup: "Pernas",
    lastPr: { weight: 70, reps: 5, date: "2024-12-03", trend: "up" },
  },
  {
    id: "terra",
    name: "Levantamento Terra",
    muscleGroup: "Costas",
    lastPr: { weight: 90, reps: 3, date: "2024-11-30", trend: "steady" },
  },
  {
    id: "desenvolvimento",
    name: "Desenvolvimento",
    muscleGroup: "Ombros",
    lastPr: { weight: 18, reps: 8, date: "2024-11-29", trend: "down" },
  },
];

export function useWorkoutsData(): UseWorkoutsDataReturn {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    const normalized = searchTerm.trim().toLowerCase();
    return exercisesSeed.filter((exercise) => exercise.name.toLowerCase().includes(normalized));
  }, [searchTerm]);

  return {
    workouts: workoutsSeed,
    exercises: filteredExercises,
    searchTerm,
    setSearchTerm,
  };
}

