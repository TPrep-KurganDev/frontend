import {api} from './api';
import {buildCacheKey} from '../offline/cacheKey';
import {readThroughCache} from '../offline/readThroughCache';

export interface UserOut {
  email: string,
  user_name: string,
  id: number
}

export async function getUserById(userId: number) {
  return readThroughCache(
    buildCacheKey('users:getById', [userId]),
    async () => (await api.get<UserOut>(`/users/${userId}`)).data
  );
}

export async function getUserByEmail(userEmail: string) {
  return readThroughCache(
    buildCacheKey('users:getByEmail', [userEmail]),
    async () => (await api.get<UserOut>(`/users/${userEmail}`)).data
  );
}
