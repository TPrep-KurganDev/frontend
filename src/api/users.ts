import { api } from './api';

export interface UserOut {
  email: string,
  user_name: string,
  id: number
}

export async function getUserById(userId: number) {
  const res = await api.get<UserOut>(`/users/${userId}`);
  return res.data;
}

export async function getUserByEmail(userEmail: string) {
  const res = await api.get<UserOut>(`/users/${userEmail}`);
  return res.data;
}
