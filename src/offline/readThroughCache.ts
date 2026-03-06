import {getCacheEntry, setCacheEntry} from './cacheDb';

interface ReadThroughCacheOptions {
  preferCache?: boolean;
}

function isOfflineLikeError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeAxiosError = error as {
    code?: string;
    response?: { status?: number };
    request?: unknown;
  };

  if (maybeAxiosError.code === 'ERR_NETWORK') {
    return true;
  }

  if (!maybeAxiosError.response && maybeAxiosError.request) {
    return true;
  }

  return false;
}

export async function readThroughCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options?: ReadThroughCacheOptions
): Promise<T> {
  const preferCache = options?.preferCache ?? true;

  if (preferCache) {
    let cachedEntry: { value: T } | null = null;
    try {
      cachedEntry = await getCacheEntry<T>(cacheKey);
    } catch {
      cachedEntry = null;
    }

    if (cachedEntry) {
      void fetcher()
        .then(async (freshData) => {
          try {
            await setCacheEntry(cacheKey, freshData);
          } catch (cacheError) {
            console.warn('Failed to refresh offline cache', cacheError);
          }
        })
        .catch(() => undefined);

      return cachedEntry.value;
    }
  }

  try {
    const data = await fetcher();

    try {
      await setCacheEntry(cacheKey, data);
    } catch (cacheError) {
      console.warn('Failed to write response to offline cache', cacheError);
    }

    return data;
  } catch (error) {
    if (!isOfflineLikeError(error)) {
      throw error;
    }

    const cached = await getCacheEntry<T>(cacheKey);
    if (cached) {
      return cached.value;
    }

    throw error;
  }
}
