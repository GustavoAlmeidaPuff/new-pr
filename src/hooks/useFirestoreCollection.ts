import { useEffect, useMemo, useState } from "react";

import {
  DocumentData,
  FirestoreError,
  QueryConstraint,
  collection,
  orderBy,
  query as buildQuery,
  where,
} from "firebase/firestore";

import { subscribeToCollection } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";

type UseFirestoreCollectionOptions<T> = {
  path: string;
  map?: (doc: T) => T;
  constraints?: QueryConstraint[];
  orderByField?: string;
  orderByDirection?: "asc" | "desc";
  cacheKey?: string;
};

function buildConstraintKey(constraint: QueryConstraint, index: number): string {
  const constraintRecord = constraint as Record<string, unknown>;
  const type =
    (constraintRecord.type as string) ?? constraint.constructor.name ?? `constraint-${index}`;
  const field =
    constraintRecord.fieldPath ??
    constraintRecord._fieldPath ??
    constraintRecord._query ??
    constraintRecord._fieldFilters ??
    "";

  const op = constraintRecord.opStr ?? constraintRecord._opStr ?? constraintRecord.type ?? "";
  const value =
    constraintRecord.value ??
    constraintRecord._value ??
    constraintRecord.limit ??
    constraintRecord._limit ??
    "";

  return `${type}:${String(field)}:${String(op)}:${JSON.stringify(value)}`;
}

export function useFirestoreCollection<T>({
  path,
  map,
  constraints = [],
  orderByField = "createdAt",
  orderByDirection = "desc",
  cacheKey,
}: UseFirestoreCollectionOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const serializedConstraints = useMemo(
    () => constraints.map((constraint, index) => buildConstraintKey(constraint, index)).join("|"),
    [constraints],
  );

  const effectiveCacheKey = useMemo(
    () =>
      cacheKey ??
      `collection:${path}:${orderByField}:${orderByDirection}:${serializedConstraints}`,
    [cacheKey, orderByDirection, orderByField, path, serializedConstraints],
  );

  useEffect(() => {
    setLoading(true);

    const baseRef = collection(firestore, path);

    const queryConstraints: QueryConstraint[] = [
      orderBy(orderByField, orderByDirection),
      ...constraints,
    ];

    const queryFactory = () =>
      buildQuery<DocumentData>(baseRef, ...queryConstraints);

    const unsubscribe = subscribeToCollection<T>(
      effectiveCacheKey,
      {
        queryFactory,
        map: (docSnap) => {
          const payload = { id: docSnap.id, ...docSnap.data() } as T;
          return map ? map(payload) : payload;
        },
      },
      (state) => {
        setData(state.data);
        setLoading(state.loading);
        setError(state.error);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [
    constraints,
    effectiveCacheKey,
    map,
    orderByDirection,
    orderByField,
    path,
  ]);

  return { data, loading, error };
}

export function whereEquals(field: string, value: unknown) {
  return where(field, "==", value);
}

