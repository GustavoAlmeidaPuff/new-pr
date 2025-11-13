import { useEffect, useState } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { useFirestoreCollection } from "../../../hooks/useFirestoreCollection";
import { searchExercisesByName } from "../../../services/exercises.service";
import type { Workout, WorkoutExercisePreview } from "..";

type UseWorkoutsDataReturn = {
  workouts: Workout[];
  exercises: WorkoutExercisePreview[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isSearching: boolean;
};

export function useWorkoutsData(): UseWorkoutsDataReturn {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercisePreview[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: workouts, loading } = useFirestoreCollection<Workout>({
    path: user ? `users/${user.uid}/workouts` : "workouts",
    constraints: [],
    orderByField: "createdAt",
    orderByDirection: "desc",
  });

  useEffect(() => {
    if (!searchTerm.trim() || !user) {
      setExercises([]);
      return;
    }

    const searchExercises = async () => {
      setIsSearching(true);
      try {
        const results = await searchExercisesByName(user.uid, searchTerm);
        setExercises(
          results.map((ex) => ({
            id: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
          }))
        );
      } catch (error) {
        console.error("Erro ao buscar exercícios:", error);
        setExercises([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchExercises, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  return {
    workouts: user ? workouts : [],
    exercises,
    searchTerm,
    setSearchTerm,
    isSearching,
  };
}

