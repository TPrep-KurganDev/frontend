import axios from 'axios';

function resolveApiUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, '');
  }

  return '/api';
}

export const API_URL = resolveApiUrl();

const AUTH_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/refresh',
  '/auth/token',
]);

type StoredAuthSession = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user_id: number;
};
5
type RefreshResponse = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  token_type?: string;
};

let refreshRequestPromise: Promise<string> | null = null;

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return Array.from(AUTH_ENDPOINTS).some((endpoint) => url.includes(endpoint));
}

function hasSuppressOfflineToastHeader(headers: unknown): boolean {
  if (!headers) {
    return false;
  }

  const maybeAxiosHeaders = headers as { get?: (name: string) => string | undefined };
  if (typeof maybeAxiosHeaders.get === 'function') {
    const value = maybeAxiosHeaders.get('x-suppress-offline-toast');
    return value === '1';
  }

  const plainHeaders = headers as Record<string, unknown>;
  return plainHeaders['x-suppress-offline-toast'] === '1' ||
    plainHeaders['X-Suppress-Offline-Toast'] === '1';
}

function emitBackendReachability(isReachable: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('app:backend-reachability', {
      detail: {isReachable}
    })
  );
}

export function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userId');
}

export function storeAuthSession(session: StoredAuthSession) {
  localStorage.setItem('accessToken', session.access_token);
  localStorage.setItem('tokenType', session.token_type);
  localStorage.setItem('userId', String(session.user_id));

  if (session.refresh_token) {
    localStorage.setItem('refreshToken', session.refresh_token);
    return;
  }

  localStorage.removeItem('refreshToken');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function refreshAccessToken(): Promise<string> {
  if (refreshRequestPromise) {
    return refreshRequestPromise;
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  refreshRequestPromise = axios.post<RefreshResponse>(`${API_URL}/auth/refresh`, {
    refresh_token: refreshToken,
    refreshToken,
  }).then((response) => {
    const nextAccessToken = response.data.access_token ?? response.data.accessToken;
    const nextRefreshToken = response.data.refresh_token ?? response.data.refreshToken;

    if (!nextAccessToken) {
      throw new Error('No access token in refresh response');
    }

    localStorage.setItem('accessToken', nextAccessToken);
    if (nextRefreshToken) {
      localStorage.setItem('refreshToken', nextRefreshToken);
    }
    if (response.data.token_type) {
      localStorage.setItem('tokenType', response.data.token_type);
    }

    return nextAccessToken;
  }).finally(() => {
    refreshRequestPromise = null;
  });

  return refreshRequestPromise;
}

export async function probeBackendReachability(timeoutMs = 3500): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  const token = localStorage.getItem('accessToken');
  const userId = Number(localStorage.getItem('userId'));
  if (!token || Number.isNaN(userId) || userId <= 0) {
    return true;
  }

  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      timeout: timeoutMs,
      validateStatus: () => true,
      headers: {Authorization: `Bearer ${token}`}
    });

    return response.status < 500;
  } catch {
    return false;
  }
}

api.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  const isReadOnlyMethod = method === 'get' || method === 'head';
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const suppressOfflineToast = hasSuppressOfflineToastHeader(config.headers);

  if (isOffline && !isReadOnlyMethod) {
    if (typeof window !== 'undefined' && !suppressOfflineToast) {
      window.dispatchEvent(new CustomEvent('app:offline-mutation-blocked'));
    }

    emitBackendReachability(false);

    return Promise.reject({
      name: 'OfflineMutationBlockedError',
      code: 'OFFLINE_MUTATION_BLOCKED',
      message: 'This action is only available online.',
      config
    });
  }

  const token = localStorage.getItem('accessToken');
  if (token && !isAuthEndpoint(config.url)) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    emitBackendReachability(true);
    return response;
  },
  async (error) => {
    const requestMethod = String(error?.config?.method ?? 'get').toLowerCase();
    const isMutation = requestMethod !== 'get' && requestMethod !== 'head';
    const suppressOfflineToast = hasSuppressOfflineToastHeader(error?.config?.headers);
    const hasNetworkFailure =
      error?.code === 'ERR_NETWORK' ||
      (typeof navigator !== 'undefined' && !navigator.onLine) ||
      (!error?.response && !!error?.request);

    if (hasNetworkFailure) {
      emitBackendReachability(false);

      if (isMutation && typeof window !== 'undefined') {
        if (!suppressOfflineToast) {
          window.dispatchEvent(new CustomEvent('app:offline-mutation-blocked'));
        }
      }
    }

    if (error.response?.status === 401) {
      const config = error.config as (typeof error.config & { _retry?: boolean } | undefined);

      if (!config) {
        return Promise.reject(error);
      }

      if (config._retry || isAuthEndpoint(config.url)) {
        return Promise.reject(error);
      }

      config._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(config);
      } catch (refreshError) {
        const typedRefreshError = refreshError as {
          response?: { status?: number };
          request?: unknown;
          code?: string;
        };
        const status = typedRefreshError.response?.status;
        const missingRefreshToken =
          refreshError instanceof Error && refreshError.message === 'No refresh token';
        const networkFailure =
          typedRefreshError.code === 'ERR_NETWORK' || (typeof navigator !== 'undefined' && !navigator.onLine) ||
          (!typedRefreshError.response && !!typedRefreshError.request);

        if (networkFailure) {
          emitBackendReachability(false);
          return Promise.reject(typedRefreshError);
        }

        if (missingRefreshToken || status === 401 || status === 403) {
          clearAuthStorage();
          window.location.href = '/login';
        }

        return Promise.reject(typedRefreshError);
      }
    }
    return Promise.reject(error);
  }
);
