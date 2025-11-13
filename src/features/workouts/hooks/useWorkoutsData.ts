import { useEffect, useMemo, useState } from "react";

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
  loading: boolean;
};

export function useWorkoutsData(): UseWorkoutsDataReturn {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; muscleGroup: string; weightType?: "total" | "per-side" }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Memoiza os constraints para evitar recriar a subscription
  const constraints = useMemo(() => [], []);

  const { data: workouts, loading: workoutsLoading } = useFirestoreCollection<Workout>({
    path: user ? `users/${user.uid}/workouts` : "workouts",
    constraints,
    orderByField: "name",
    orderByDirection: "asc",
  });

  const { data: workoutExercises, loading: workoutExercisesLoading } = useFirestoreCollection<{
    id: string;
    workoutId: string;
    exerciseId: string;
  }>({
    path: user ? `users/${user.uid}/workoutExercises` : "users/__placeholder__/workoutExercises",
    orderByField: "createdAt",
    orderByDirection: "asc",
  });

  useEffect(() => {
    if (!searchTerm.trim() || !user) {
      setSearchResults([]);
      return;
    }

    const searchExercises = async () => {
      setIsSearching(true);
      try {
        const results = await searchExercisesByName(user.uid, searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error("Erro ao buscar exercícios:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchExercises, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  const exercises = useMemo<WorkoutExercisePreview[]>(() => {
    if (!user) {
      return [];
    }

    const workoutsById = new Map(workouts.map((workout) => [workout.id, workout.name]));
    const workoutsByExercise = workoutExercises.reduce<Map<string, string[]>>((acc, item) => {
      if (!acc.has(item.exerciseId)) {
        acc.set(item.exerciseId, []);
      }
      const workoutName = workoutsById.get(item.workoutId);
      if (workoutName) {
        acc.get(item.exerciseId)?.push(workoutName);
      }
      return acc;
    }, new Map());

    return searchResults.map((exercise) => ({
      ...exercise,
      workoutNames: workoutsByExercise.get(exercise.id) ?? [],
    }));
  }, [user, workouts, workoutExercises, searchResults]);

  return {
    workouts: user ? workouts : [],
    exercises,
    searchTerm,
    setSearchTerm,
    isSearching,
    loading: user ? workoutsLoading || workoutExercisesLoading : false,
  };
}

