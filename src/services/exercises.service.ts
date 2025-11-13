import {
  collection,
  doc,
  query,
  serverTimestamp,
  writeBatch,
  orderBy,
} from "firebase/firestore";

import { getCollectionData, getDocumentData } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";

/**
 * Retorna o caminho da coleção de exercícios do usuário
 */
function getExercisesPath(userId: string): string {
  return `users/${userId}/exercises`;
}

export type CreateExerciseInput = {
  userId: string;
  name: string;
  muscleGroup: string;
  muscles?: string[];
  notes?: string;
  weightType?: "total" | "per-side"; // total = peso único, per-side = peso por lado
};

export type UpdateExerciseInput = {
  name?: string;
  muscleGroup?: string;
  muscles?: string[];
  notes?: string;
  weightType?: "total" | "per-side";
};

/**
 * Cria um novo exercício
 */
export async function createExercise(input: CreateExerciseInput): Promise<string> {
  const exercisesPath = getExercisesPath(input.userId);
  const newExerciseRef = doc(collection(firestore, exercisesPath));
  const batch = writeBatch(firestore);

  batch.set(newExerciseRef, {
    name: input.name,
    muscleGroup: input.muscleGroup,
    muscles: input.muscles || [input.muscleGroup],
    notes: input.notes || "",
    weightType: input.weightType || "total",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return newExerciseRef.id;
}

/**
 * Atualiza um exercício existente
 */
export async function updateExercise(
  userId: string,
  exerciseId: string,
  input: UpdateExerciseInput
): Promise<void> {
  const exercisesPath = getExercisesPath(userId);
  const exerciseRef = doc(firestore, exercisesPath, exerciseId);
  const batch = writeBatch(firestore);

  batch.update(exerciseRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Remove um exercício
 */
export async function deleteExercise(userId: string, exerciseId: string): Promise<void> {
  const exercisesPath = getExercisesPath(userId);
  const exerciseRef = doc(firestore, exercisesPath, exerciseId);
  const batch = writeBatch(firestore);
  batch.delete(exerciseRef);
  await batch.commit();
}

/**
 * Busca exercícios por nome (para busca/autocomplete)
 */
export type ExerciseRecord = {
  id: string;
  name: string;
  muscleGroup: string;
  muscles?: string[];
  notes?: string;
  weightType?: "total" | "per-side";
  createdAt?: unknown;
  updatedAt?: unknown;
};

export async function searchExercisesByName(
  userId: string,
  searchTerm: string
): Promise<Array<{ id: string; name: string; muscleGroup: string }>> {
  const exercisesPath = getExercisesPath(userId);
  const queryFactory = () => query(collection(firestore, exercisesPath), orderBy("name"));

  const exercises = await getCollectionData<{ id: string; name: string; muscleGroup: string }>(
    `exercises:${userId}:all`,
    {
      queryFactory,
      map: (docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          muscleGroup: data.muscleGroup,
        };
      },
    }
  );

  // Filtra localmente por causa das limitações do Firestore
  const normalizedSearch = searchTerm.toLowerCase().trim();
  return exercises.filter((ex) => ex.name.toLowerCase().includes(normalizedSearch));
}

export async function getExerciseById<T = ExerciseRecord>(
  userId: string,
  exerciseId: string,
  map?: (data: ExerciseRecord) => T
): Promise<T | null> {
  const exercisesPath = getExercisesPath(userId);

  return getDocumentData<T | null>(`exercise:${userId}:${exerciseId}`, {
    refFactory: () => doc(firestore, exercisesPath, exerciseId),
    map: (snapshot) => {
      if (!snapshot || !snapshot.exists()) {
        return null;
      }

      const payload = {
        id: snapshot.id,
        ...snapshot.data(),
      } as ExerciseRecord;

      return map ? map(payload) : (payload as unknown as T);
    },
  });
}
