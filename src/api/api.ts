import axios from 'axios';

export const API_URL = 'http://127.0.0.1:8000/api';

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

function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userId');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function probeBackendReachability(): Promise<boolean> {
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
      timeout: 3500,
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
  if (token) {
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
      if (isMutation && typeof window !== 'undefined') {
        emitBackendReachability(false);
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

      if (config._retry) {
        return Promise.reject(error);
      }

      config._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token;
        const newRefreshToken = res.data.refresh_token;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(config);
      } catch (refreshError) {
        const typedRefreshError = refreshError as {
          response?: { status?: number };
          request?: unknown;
          code?: string;
        };
        const status = typedRefreshError.response?.status;
        const networkFailure =
          typedRefreshError.code === 'ERR_NETWORK' || (typeof navigator !== 'undefined' && !navigator.onLine) ||
          (!typedRefreshError.response && !!typedRefreshError.request);

        if (networkFailure) {
          emitBackendReachability(false);
          return Promise.reject(typedRefreshError);
        }

        if (status === 401 || status === 403) {
          console.log('Refresh failed — redirect to login');
          clearAuthStorage();
          window.location.href = '/login';
        }

        return Promise.reject(typedRefreshError);
      }
    }
    return Promise.reject(error);
  }
);
