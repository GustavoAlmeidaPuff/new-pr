import { useMemo, useState } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { useFirestoreCollection } from "../../../hooks/useFirestoreCollection";
import type { ExerciseRecord } from "../../../services/exercises.service";

export type ExerciseListItem = Pick<
  ExerciseRecord,
  "id" | "name" | "muscleGroup" | "weightType"
>;

type UseExercisesListDataReturn = {
  exercises: ExerciseListItem[];
  filteredExercises: ExerciseListItem[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  loading: boolean;
};

function normalizeSearch(value: string): string {
  return value.toLowerCase().trim().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function useExercisesListData(): UseExercisesListDataReturn {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: exercises, loading } = useFirestoreCollection<ExerciseListItem>({
    path: user ? `users/${user.uid}/exercises` : "users/__placeholder__/exercises",
    orderByField: "name",
    orderByDirection: "asc",
  });

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return exercises;
    const term = normalizeSearch(searchTerm);
    return exercises.filter((ex) => {
      const nameMatch = normalizeSearch(ex.name).includes(term);
      const groupMatch = normalizeSearch(ex.muscleGroup).includes(term);
      return nameMatch || groupMatch;
    });
  }, [exercises, searchTerm]);

  return {
    exercises,
    filteredExercises,
    searchTerm,
    setSearchTerm,
    loading: user ? loading : false,
  };
}
