import { api } from './api.ts'


export async function register(data: { email: string; password: string; user_name: string }) {
  return api.post('/auth/register', data);
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data);

  console.log(res);
  localStorage.setItem('accessToken', res.data.access_token);
  if (res.data.refresh_token) {
    localStorage.setItem('refreshToken', res.data.refresh_token);
  }
  localStorage.setItem('tokenType', res.data.token_type);
  localStorage.setItem('userId', res.data.user_id);

  return res.data;
}

export async function getProfile() {
  return api.get('/users/me');
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userId');
  window.location.href = '/login';
}
