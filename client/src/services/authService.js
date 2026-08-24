import api from './api';

export const register = async ({ realName, username, email, password, repeatPassword, phone }) => {
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

export const login = async ({ emailOrUsername, password }) => {
  const response = await api.post('/auth/login', {
    emailOrUsername,
    password,
  });
  return response.data;
};

export const oauthLogin = async ({ name, email, provider, avatar }) => {
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

export const createUserAdmin = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUserAdmin = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUserAdmin = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
