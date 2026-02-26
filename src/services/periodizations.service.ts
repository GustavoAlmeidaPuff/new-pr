import {
  DocumentReference,
  addDoc,
  collection,
  doc,
  query,
  serverTimestamp,
  writeBatch,
  limit,
  where,
  getDocs,
} from "firebase/firestore";

import { getCollectionData, getDocumentData } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";
import type { Periodization } from "../features/periodizations/types";

/**
 * IDs fixos das três periodizações (sempre existem, não se criam outras)
 */
export const PERIODIZATION_IDS = ["base", "shock", "deload"] as const;
export const PERIODIZATION_NAMES: Record<(typeof PERIODIZATION_IDS)[number], string> = {
  base: "Base",
  shock: "Shock",
  deload: "Deload",
};

/**
 * Retorna o caminho da coleção de periodizações do usuário
 */
function getPeriodizationsPath(userId: string): string {
  return `users/${userId}/periodizations`;
}

const DEFAULT_DURATION_DAYS = 14;

export type CreatePeriodizationInput = {
  userId: string;
  name: string;
  startDate: string;
  durationDays: number;
};

/**
 * Cria uma nova periodização para o usuário.
 */
export async function createPeriodization(input: CreatePeriodizationInput): Promise<void> {
  const { userId, name, startDate, durationDays } = input;
  const periodizationsPath = getPeriodizationsPath(userId);
  const coll = collection(firestore, periodizationsPath);
  await addDoc(coll, {
    name,
    startDate,
    durationDays,
    status: "upcoming",
    prs: 0,
    progressPercent: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Garante que existem as 3 periodizações fixas (Base, Shock, Deload).
 * Cria as que faltam com IDs fixos; se não houver nenhuma ativa, ativa Base.
 */
export async function ensureDefaultPeriodizations(userId: string): Promise<void> {
  const periodizationsPath = getPeriodizationsPath(userId);
  const coll = collection(firestore, periodizationsPath);
  const snapshot = await getDocs(coll);
  const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string; status?: string }));
  const existingIds = new Set(list.map((p) => p.id));
  const hasActive = list.some((p) => p.status === "active");
  const today = new Date().toISOString().split("T")[0];

  let hasWrites = false;
  const batch = writeBatch(firestore);

  for (const id of PERIODIZATION_IDS) {
    if (existingIds.has(id)) continue;
    hasWrites = true;
    const isFirstAndNoActive = id === "base" && !hasActive;
    const ref = doc(firestore, periodizationsPath, id);
    batch.set(ref, {
      name: PERIODIZATION_NAMES[id],
      startDate: today,
      durationDays: DEFAULT_DURATION_DAYS,
      status: isFirstAndNoActive ? "active" : "upcoming",
      prs: 0,
      progressPercent: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  if (hasWrites) {
    await batch.commit();
  }

  if (!hasActive) {
    await activatePeriodization(userId, "base");
  }
}

export type UpdatePeriodizationInput = {
  name?: string;
  startDate?: string;
  durationDays?: number;
  status?: "active" | "completed" | "upcoming";
};

/**
 * Ativa uma periodização existente e desativa todas as outras
 */
export async function activatePeriodization(
  userId: string,
  periodizationId: string
): Promise<void> {
  const batch = writeBatch(firestore);
  const periodizationsPath = getPeriodizationsPath(userId);

  // Desativa todas as periodizações ativas do usuário
  const activePeriodizations = await getCollectionData<{ ref: DocumentReference }>(
    `periodizations:${userId}:active`,
    {
      queryFactory: () =>
        query(collection(firestore, periodizationsPath), where("status", "==", "active")),
      map: (docSnap) => ({
        ref: docSnap.ref,
      }),
    },
  );

  activePeriodizations.forEach(({ ref }) => {
    batch.update(ref, {
      status: "completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  // Ativa a periodização selecionada
  const periodizationRef = doc(firestore, periodizationsPath, periodizationId);
  batch.update(periodizationRef, {
    status: "active",
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Busca a periodização ativa do usuário
 */
export async function getActivePeriodization(
  userId: string
): Promise<Periodization | null> {
  const periodizationsPath = getPeriodizationsPath(userId);
  const q = query(
    collection(firestore, periodizationsPath),
    where("status", "==", "active"),
    limit(1)
  );

  const results = await getCollectionData<Periodization>(
    `periodizations:${userId}:active:single`,
    {
      queryFactory: () => q,
      map: (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as Periodization,
    },
  );

  return results[0] ?? null;
}

/**
 * Atualiza o contador de PRs de uma periodização
 */
export async function incrementPeriodizationPRs(
  userId: string,
  periodizationId: string
): Promise<void> {
  const periodizationsPath = getPeriodizationsPath(userId);
  const periodizationRef = doc(firestore, periodizationsPath, periodizationId);
  const batch = writeBatch(firestore);

  const currentPeriodization = await getDocumentData<Periodization | null>(
    `periodizations:${userId}:${periodizationId}`,
    {
      refFactory: () => periodizationRef,
      map: (docSnap) => {
        if (!docSnap || !docSnap.exists()) {
          return null;
        }
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Periodization;
      },
    },
  );

  if (!currentPeriodization) {
    return;
  }

  const currentPrs = currentPeriodization.prs || 0;

  batch.update(periodizationRef, {
    prs: currentPrs + 1,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Atualiza uma periodização existente
 */
export async function updatePeriodization(
  userId: string,
  periodizationId: string,
  input: UpdatePeriodizationInput
): Promise<void> {
  const periodizationsPath = getPeriodizationsPath(userId);
  const periodizationRef = doc(firestore, periodizationsPath, periodizationId);
  const batch = writeBatch(firestore);

  batch.update(periodizationRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Remove uma periodização
 */
export async function deletePeriodization(userId: string, periodizationId: string): Promise<void> {
  const periodizationsPath = getPeriodizationsPath(userId);
  const periodizationRef = doc(firestore, periodizationsPath, periodizationId);
  const batch = writeBatch(firestore);
  batch.delete(periodizationRef);
  await batch.commit();
}

/**
 * Calcula o progresso de uma periodização
 */
export function calculatePeriodizationProgress(
  startDate: string,
  durationDays: number
): number {
  const start = new Date(startDate);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, (daysPassed / durationDays) * 100));
  return Math.round(progress);
}

