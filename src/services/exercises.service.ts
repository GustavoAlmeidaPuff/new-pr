import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  writeBatch,
  orderBy,
} from "firebase/firestore";

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
export async function searchExercisesByName(
  userId: string,
  searchTerm: string
): Promise<Array<{ id: string; name: string; muscleGroup: string }>> {
  const exercisesPath = getExercisesPath(userId);
  const q = query(collection(firestore, exercisesPath), orderBy("name"));

  const snapshot = await getDocs(q);
  const exercises = snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    muscleGroup: doc.data().muscleGroup,
  }));

  // Filtra localmente por causa das limitações do Firestore
  const normalizedSearch = searchTerm.toLowerCase().trim();
  return exercises.filter((ex) => ex.name.toLowerCase().includes(normalizedSearch));
}
