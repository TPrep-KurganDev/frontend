import {useEffect, useState} from 'react';
import {probeBackendReachability} from '../api/api';

const BACKEND_REACHABLE_STORAGE_KEY = 'app:backend-reachable';

function readInitialBrowserOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

function readInitialBackendReachable(isBrowserOnline: boolean): boolean {
  if (!isBrowserOnline) {
    return false;
  }

  if (typeof window === 'undefined') {
    return true;
  }

  const storedValue = window.localStorage.getItem(BACKEND_REACHABLE_STORAGE_KEY);
  if (storedValue === '0') {
    return false;
  }

  if (storedValue === '1') {
    return true;
  }

  return true;
}

function persistBackendReachable(isReachable: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(BACKEND_REACHABLE_STORAGE_KEY, isReachable ? '1' : '0');
}

function emitBackendReachableEvent(isReachable: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('app:backend-reachability', {
      detail: {isReachable}
    })
  );
}

export function useNetworkStatus() {
  const [isBrowserOnline, setIsBrowserOnline] = useState(readInitialBrowserOnline);
  const [isBackendReachable, setIsBackendReachable] = useState(() => readInitialBackendReachable(readInitialBrowserOnline()));

  useEffect(() => {
    const goOnline = () => setIsBrowserOnline(true);
    const goOffline = () => {
      setIsBrowserOnline(false);
      setIsBackendReachable(false);
      persistBackendReachable(false);
      emitBackendReachableEvent(false);
    };
    const onBackendReachability = (event: Event) => {
      const customEvent = event as CustomEvent<{ isReachable?: boolean }>;
      if (typeof customEvent.detail?.isReachable === 'boolean') {
        setIsBackendReachable(customEvent.detail.isReachable);
        persistBackendReachable(customEvent.detail.isReachable);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== BACKEND_REACHABLE_STORAGE_KEY) {
        return;
      }

      if (event.newValue === '0') {
        setIsBackendReachable(false);
      } else if (event.newValue === '1') {
        setIsBackendReachable(true);
      }
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('app:backend-reachability', onBackendReachability as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('app:backend-reachability', onBackendReachability as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!isBrowserOnline) {
      return;
    }

    let cancelled = false;
    let failedAttempts = 0;
    const maxFailedAttempts = 1;
    const probeIntervalMs = isBackendReachable ? 10000 : 2000;

    const probeBackend = async () => {
      const reachable = await probeBackendReachability();

      if (cancelled) {
        return;
      }

      if (reachable) {
        failedAttempts = 0;
        if (!isBackendReachable) {
          setIsBackendReachable(true);
          persistBackendReachable(true);
          emitBackendReachableEvent(true);
        }
      } else {
        failedAttempts += 1;
        if (failedAttempts >= maxFailedAttempts && isBackendReachable) {
          setIsBackendReachable(false);
          persistBackendReachable(false);
          emitBackendReachableEvent(false);
        }
      }
    };

    void probeBackend();
    const interval = window.setInterval(() => {
      void probeBackend();
    }, probeIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isBackendReachable, isBrowserOnline]);

  return isBrowserOnline && isBackendReachable;
}
