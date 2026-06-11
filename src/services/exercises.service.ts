import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  writeBatch,
  orderBy,
} from "firebase/firestore";

import { getCollectionData, getDocumentData } from "../cache/firestoreCache";
import { getActiveFirestore } from "../config/firebase";

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
  const newExerciseRef = doc(collection(getActiveFirestore(), exercisesPath));
  const batch = writeBatch(getActiveFirestore());

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
  const exerciseRef = doc(getActiveFirestore(), exercisesPath, exerciseId);
  const batch = writeBatch(getActiveFirestore());

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
  const exerciseRef = doc(getActiveFirestore(), exercisesPath, exerciseId);
  const batch = writeBatch(getActiveFirestore());
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
): Promise<Array<{ id: string; name: string; muscleGroup: string; weightType?: "total" | "per-side" }>> {
  const exercisesPath = getExercisesPath(userId);
  // Adiciona timestamp ao cache key para forçar atualização
  const cacheKey = `exercises:${userId}:all:${Date.now()}`;
  const queryFactory = () => query(collection(getActiveFirestore(), exercisesPath), orderBy("name"));

  const exercises = await getCollectionData<{ id: string; name: string; muscleGroup: string; weightType?: "total" | "per-side" }>(
    cacheKey,
    {
      queryFactory,
      map: (docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          muscleGroup: data.muscleGroup,
          weightType: data.weightType as "total" | "per-side" | undefined,
        };
      },
    }
  );

  // Filtra localmente por causa das limitações do Firestore
  const normalizedSearch = searchTerm.toLowerCase().trim();
  return exercises.filter((ex) => ex.name.toLowerCase().includes(normalizedSearch));
}

/**
 * Lista todos os exercícios do usuário (sem cache, leitura direta).
 * Usado em fluxos pontuais como exportação/transferência.
 */
export async function listAllExercises(userId: string): Promise<ExerciseRecord[]> {
  const exercisesPath = getExercisesPath(userId);
  const snapshot = await getDocs(
    query(collection(getActiveFirestore(), exercisesPath), orderBy("name"))
  );
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      muscleGroup: data.muscleGroup,
      muscles: data.muscles,
      notes: data.notes,
      weightType: data.weightType,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as ExerciseRecord;
  });
}

/**
 * Cria múltiplos exercícios em um único batch, pulando aqueles cujo nome (case-insensitive)
 * já existe na coleção do usuário. Retorna a quantidade efetivamente importada.
 */
export async function importExercises(
  userId: string,
  exercises: Array<Omit<ExerciseRecord, "id" | "createdAt" | "updatedAt">>
): Promise<{ imported: number; skipped: number }> {
  const exercisesPath = getExercisesPath(userId);
  const existing = await listAllExercises(userId);
  const existingNames = new Set(existing.map((ex) => ex.name.trim().toLowerCase()));

  const batch = writeBatch(getActiveFirestore());
  let imported = 0;
  let skipped = 0;

  for (const ex of exercises) {
    const normalized = ex.name.trim().toLowerCase();
    if (existingNames.has(normalized)) {
      skipped += 1;
      continue;
    }
    existingNames.add(normalized);
    const newRef = doc(collection(getActiveFirestore(), exercisesPath));
    batch.set(newRef, {
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      muscles: ex.muscles ?? [ex.muscleGroup],
      notes: ex.notes ?? "",
      weightType: ex.weightType ?? "total",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    imported += 1;
  }

  if (imported > 0) {
    await batch.commit();
  }
  return { imported, skipped };
}

export async function getExerciseById<T = ExerciseRecord>(
  userId: string,
  exerciseId: string,
  map?: (data: ExerciseRecord) => T
): Promise<T | null> {
  const exercisesPath = getExercisesPath(userId);

  return getDocumentData<T | null>(`exercise:${userId}:${exerciseId}`, {
    refFactory: () => doc(getActiveFirestore(), exercisesPath, exerciseId),
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
