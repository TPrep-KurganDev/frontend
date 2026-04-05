import {api, clearAuthStorage, storeAuthSession} from './api.ts'
import {clearCacheEntries} from '../offline/cacheDb';

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
};

export async function register(data: { email: string; password: string; user_name: string }) {
  return api.post('/auth/register', data);
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post<LoginResponse>('/auth/login', data);

  storeAuthSession(res.data);

  return res.data;
}

export async function getProfile() {
  const userId = Number(localStorage.getItem('userId'));
  if (Number.isNaN(userId) || userId <= 0) {
    throw new Error('No user id in local storage');
  }

  return api.get(`/users/${userId}`);
}

export async function logout() {
  clearAuthStorage();

  try {
    await clearCacheEntries();
  } catch (error) {
    console.error('Failed to clear offline cache on logout', error);
  }

  window.location.href = '/login';
}
