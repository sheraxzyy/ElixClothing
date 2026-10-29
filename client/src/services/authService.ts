import api from './api';

export interface RegisterPayload {
  realName: string;
  username: string;
  email: string;
  password?: string;
  repeatPassword?: string;
  phone?: string;
  [key: string]: any;
}

export interface LoginPayload {
  emailOrUsername: string;
  password?: string;
  [key: string]: any;
}

export interface OAuthPayload {
  name: string;
  email: string;
  provider: string;
  avatar?: string;
  [key: string]: any;
}

export const register = async ({ realName, username, email, password, repeatPassword, phone }: RegisterPayload) => {
  const response = await api.post('/auth/register', {
    realName,
    username,
    email,
    password,
    repeatPassword,
    phone,
  });
  return response.data;
};

export const login = async ({ emailOrUsername, password }: LoginPayload) => {
  const response = await api.post('/auth/login', {
    emailOrUsername,
    password,
  });
  return response.data;
};

export const oauthLogin = async ({ name, email, provider, avatar }: OAuthPayload) => {
  const response = await api.post('/auth/oauth', {
    name,
    email,
    provider,
    avatar,
  });
  return response.data;
};

export const fetchProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUserAdmin = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUserAdmin = async (id: string, userData: any) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUserAdmin = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
