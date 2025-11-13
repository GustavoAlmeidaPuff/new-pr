import { useEffect, useMemo, useState } from "react";

import { doc } from "firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
} from "firebase/firestore";

import { getDocumentData, subscribeToDocument } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";

type UseFirestoreDocumentOptions<T> = {
  path: string;
  listen?: boolean;
  map?: (doc: T) => T;
  cacheKey?: string;
};

export function useFirestoreDocument<T>({
  path,
  listen = true,
  map,
  cacheKey,
}: UseFirestoreDocumentOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const referenceFactory = useMemo(
    () => () => doc(firestore, path) as DocumentReference<DocumentData>,
    [path],
  );

  const effectiveCacheKey = useMemo(
    () => cacheKey ?? `document:${path}`,
    [cacheKey, path],
  );

  const mapSnapshot = useMemo(
    () => (snapshot: DocumentSnapshot<DocumentData> | null) => {
      if (!snapshot || !snapshot.exists()) {
        return null;
      }

      const payload = { id: snapshot.id, ...snapshot.data() } as T;
      return map ? map(payload) : payload;
    },
    [map],
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (!listen) {
      getDocumentData<T>(effectiveCacheKey, {
        refFactory: referenceFactory,
        map: mapSnapshot,
      })
        .then((result) => {
          if (!isMounted) {
            return;
          }
          setData(result);
          setError(null);
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) {
            return;
          }
          setError(err);
          setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }

    const unsubscribe = subscribeToDocument<T>(effectiveCacheKey, {
      refFactory: referenceFactory,
      map: mapSnapshot,
    }, (state) => {
      setData(state.data);
      setLoading(state.loading);
      setError(state.error);
    });

    return () => {
      unsubscribe();
    };
  }, [effectiveCacheKey, listen, mapSnapshot, referenceFactory]);

  return { data, loading, error };
}

