const DB_NAME = 'tprep-offline-cache';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

export interface CacheEntry<T> {
  key: string;
  value: T;
  updatedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {keyPath: 'key'});
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void
): Promise<T> {
  return openDb().then((db) => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };

    operation(store, resolve, reject);
  }));
}

export async function getCacheEntry<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    return await withStore<CacheEntry<T> | null>('readonly', (store, resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as CacheEntry<T> | undefined) ?? null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch {
    return null;
  }
}

export async function setCacheEntry<T>(key: string, value: T): Promise<void> {
  const entry: CacheEntry<T> = {
    key,
    value,
    updatedAt: Date.now()
  };

  await withStore<void>('readwrite', (store, resolve, reject) => {
    const request = store.put(entry);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearCacheEntries(): Promise<void> {
  await withStore<void>('readwrite', (store, resolve, reject) => {
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteCacheEntry(key: string): Promise<void> {
  await withStore<void>('readwrite', (store, resolve, reject) => {
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
