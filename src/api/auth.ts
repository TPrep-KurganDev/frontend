import { http } from './httpClient';

// ----------- Types -------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string; // "bearer"
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  user_name: string;
}

export interface UserOut {
  id: number;
  email: string;
  user_name: string;
}

// -------- Token Storage ----------

const tokenStorage = {
  set(access: string | null) {
    if (access) localStorage.setItem('accessToken', access);
    else localStorage.removeItem('accessToken');
  },

  get() {
    return localStorage.getItem('accessToken');
  },

  clear() {
    localStorage.removeItem('accessToken');
  }
};

// -------- Auth API -------------

export const authApi = {

  // REGISTRATION
  async register(payload: RegisterRequest): Promise<UserOut> {
    const { data } = await http.post<UserOut>('/auth/register', payload);
    return data;
  },

  // LOGIN
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await http.post<LoginResponse>('/auth/login', payload);

    // backend returns access_token, not accessToken
    tokenStorage.set(data.access_token);

    return data;
  },

  // REFRESH ACCESS TOKEN
  async refresh(): Promise<RefreshResponse> {
    const refreshToken = tokenStorage.get();
    if (!refreshToken) throw new Error('No token to refresh');

    const { data } = await http.post<RefreshResponse>('/auth/refresh', {
      refreshToken
    });

    // backend returns accessToken
    tokenStorage.set(data.accessToken);

    return data;
  },

  // LOGOUT
  logout() {
    tokenStorage.clear();
  }
};
