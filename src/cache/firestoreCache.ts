import { onSnapshot } from "firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
  Query,
  QueryDocumentSnapshot,
  Unsubscribe,
} from "firebase/firestore";

type CacheState<T> = {
  data: T;
  loading: boolean;
  error: FirestoreError | null;
};

type CollectionListenerRecord = {
  notify: (entry: CollectionEntry) => void;
};

type CollectionEntry = {
  snapshots: QueryDocumentSnapshot<DocumentData>[];
  loading: boolean;
  error: FirestoreError | null;
  listeners: Set<CollectionListenerRecord>;
  unsubscribe?: Unsubscribe;
  queryFactory: () => Query<DocumentData>;
};

type DocumentListenerRecord = {
  notify: (entry: DocumentEntry) => void;
};

type DocumentEntry = {
  snapshot: DocumentSnapshot<DocumentData> | null;
  loading: boolean;
  error: FirestoreError | null;
  listeners: Set<DocumentListenerRecord>;
  unsubscribe?: Unsubscribe;
  refFactory: () => DocumentReference<DocumentData>;
};

const collectionCache = new Map<string, CollectionEntry>();
const documentCache = new Map<string, DocumentEntry>();

function defaultCollectionMapper(docSnap: QueryDocumentSnapshot<DocumentData>) {
  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

function defaultDocumentMapper(docSnap: DocumentSnapshot<DocumentData> | null) {
  if (!docSnap || !docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

function ensureCollectionEntry(
  key: string,
  queryFactory: () => Query<DocumentData>,
): CollectionEntry {
  let entry = collectionCache.get(key);

  if (!entry) {
    entry = {
      snapshots: [],
      loading: true,
      error: null,
      listeners: new Set(),
      queryFactory,
    };
    collectionCache.set(key, entry);
  } else {
    entry.queryFactory = queryFactory;
  }

  if (!entry.unsubscribe) {
    console.log('[firestoreCache] Creating onSnapshot subscription', { key });
    entry.unsubscribe = onSnapshot(
      entry.queryFactory(),
      (snapshot) => {
        console.log('[firestoreCache] Snapshot received', { 
          key, 
          docsCount: snapshot.docs.length,
          docChanges: snapshot.docChanges().map(c => ({
            type: c.type,
            id: c.doc.id
          }))
        });
        entry.snapshots = snapshot.docs;
        entry.loading = false;
        entry.error = null;
        notifyCollectionListeners(entry);
      },
      (error) => {
        console.error('[firestoreCache] Snapshot error', { key, error });
        entry.loading = false;
        entry.error = error;
        notifyCollectionListeners(entry);
      },
    );
  }

  return entry;
}

function ensureDocumentEntry(
  key: string,
  refFactory: () => DocumentReference<DocumentData>,
): DocumentEntry {
  let entry = documentCache.get(key);

  if (!entry) {
    entry = {
      snapshot: null,
      loading: true,
      error: null,
      listeners: new Set(),
      refFactory,
    };
    documentCache.set(key, entry);
  } else {
    entry.refFactory = refFactory;
  }

  if (!entry.unsubscribe) {
    entry.unsubscribe = onSnapshot(
      entry.refFactory(),
      (snapshot) => {
        entry.snapshot = snapshot;
        entry.loading = false;
        entry.error = null;
        notifyDocumentListeners(entry);
      },
      (error) => {
        entry.loading = false;
        entry.error = error;
        notifyDocumentListeners(entry);
      },
    );
  }

  return entry;
}

function notifyCollectionListeners(entry: CollectionEntry) {
  entry.listeners.forEach((listener) => listener.notify(entry));
}

function notifyDocumentListeners(entry: DocumentEntry) {
  entry.listeners.forEach((listener) => listener.notify(entry));
}

/**
 * Assina uma coleção Firestore compartilhando a mesma escuta entre consumidores.
 */
export function subscribeToCollection<T>(
  key: string,
  options: {
    queryFactory: () => Query<DocumentData>;
    map?: (doc: QueryDocumentSnapshot<DocumentData>) => T;
  },
  listener: (state: CacheState<T[]>) => void,
): () => void {
  const entry = ensureCollectionEntry(key, options.queryFactory);

  const record: CollectionListenerRecord = {
    notify: (collectionEntry) => {
      const mapper = options.map ?? defaultCollectionMapper;
      const mappedData = collectionEntry.snapshots.map((docSnap) => mapper(docSnap)) as T[];

      listener({
        data: mappedData,
        loading: collectionEntry.loading,
        error: collectionEntry.error,
      });
    },
  };

  entry.listeners.add(record);
  record.notify(entry);

  return () => {
    entry.listeners.delete(record);
  };
}

/**
 * Obtém os dados de uma coleção usando o cache compartilhado.
 */
export function getCollectionData<T>(key: string, options: {
  queryFactory: () => Query<DocumentData>;
  map?: (doc: QueryDocumentSnapshot<DocumentData>) => T;
}): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined;

    unsubscribe = subscribeToCollection<T>(key, options, (state) => {
      if (state.loading) {
        return;
      }

      if (unsubscribe) {
        unsubscribe();
      } else {
        queueMicrotask(() => unsubscribe?.());
      }

      if (state.error) {
        reject(state.error);
        return;
      }

      resolve(state.data);
    });
  });
}

/**
 * Assina um documento Firestore compartilhando a mesma escuta entre consumidores.
 */
export function subscribeToDocument<T>(
  key: string,
  options: {
    refFactory: () => DocumentReference<DocumentData>;
    map?: (snapshot: DocumentSnapshot<DocumentData> | null) => T | null;
  },
  listener: (state: CacheState<T | null>) => void,
): () => void {
  const entry = ensureDocumentEntry(key, options.refFactory);

  const record: DocumentListenerRecord = {
    notify: (documentEntry) => {
      const mapper = options.map ?? defaultDocumentMapper;
      const mappedData = mapper(documentEntry.snapshot) as T | null;

      listener({
        data: mappedData,
        loading: documentEntry.loading,
        error: documentEntry.error,
      });
    },
  };

  entry.listeners.add(record);
  record.notify(entry);

  return () => {
    entry.listeners.delete(record);
  };
}

/**
 * Obtém os dados de um documento usando o cache compartilhado.
 */
export function getDocumentData<T>(
  key: string,
  options: {
    refFactory: () => DocumentReference<DocumentData>;
    map?: (snapshot: DocumentSnapshot<DocumentData> | null) => T | null;
  },
): Promise<T | null> {
  return new Promise<T | null>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined;

    unsubscribe = subscribeToDocument<T>(key, options, (state) => {
      if (state.loading) {
        return;
      }

      if (unsubscribe) {
        unsubscribe();
      } else {
        queueMicrotask(() => unsubscribe?.());
      }

      if (state.error) {
        reject(state.error);
        return;
      }

      resolve(state.data);
    });
  });
}

/**
 * Limpa o cache local (principalmente usado em testes).
 */
export function clearFirestoreCache() {
  collectionCache.forEach((entry) => {
    entry.unsubscribe?.();
    entry.listeners.clear();
  });
  collectionCache.clear();

  documentCache.forEach((entry) => {
    entry.unsubscribe?.();
    entry.listeners.clear();
  });
  documentCache.clear();
}

