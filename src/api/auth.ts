import { api } from './api.ts'


export async function register(data: { email: string; password: string; user_name: string }) {
  return api.post('/auth/register', data);
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data);

  localStorage.setItem('accessToken', res.data.access_token);
  localStorage.setItem('tokenType', res.data.token_type);

  return res.data;
}

export async function getProfile() {
  const token = localStorage.getItem('accessToken');

  return api.get('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
