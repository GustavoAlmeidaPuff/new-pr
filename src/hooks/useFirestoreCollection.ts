import { useEffect, useState } from "react";

import {
  FirestoreError,
  Query,
  QueryConstraint,
  collection,
  onSnapshot,
  orderBy,
  query as buildQuery,
  where,
} from "firebase/firestore";

import { firestore } from "../config/firebase";

type UseFirestoreCollectionOptions<T> = {
  path: string;
  map?: (doc: T) => T;
  constraints?: QueryConstraint[];
  orderByField?: string;
  orderByDirection?: "asc" | "desc";
};

export function useFirestoreCollection<T>({
  path,
  map,
  constraints = [],
  orderByField = "createdAt",
  orderByDirection = "desc",
}: UseFirestoreCollectionOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const baseRef = collection(firestore, path);

    const queryConstraints: QueryConstraint[] = [
      orderBy(orderByField, orderByDirection),
      ...constraints,
    ];

    const q: Query = buildQuery(baseRef, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const payload = { id: doc.id, ...doc.data() } as T;
          return map ? map(payload) : payload;
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [constraints, map, orderByDirection, orderByField, path]);

  return { data, loading, error };
}

export function whereEquals(field: string, value: unknown) {
  return where(field, "==", value);
}

