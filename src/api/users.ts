import { http } from './httpClient';

export interface User {
  id: number;
  name: string;
  email: string;
}

export const usersApi = {
  async getAll(): Promise<User[]> {
    return http.get('/users');
  },

  async getById(id: number): Promise<User> {
    return http.get(`/users/${id}`);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    return http.post('/users', data);
  },

  async update(id: number, data: Partial<User>): Promise<User> {
    return http.put(`/users/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return http.delete(`/users/${id}`);
  },
};
