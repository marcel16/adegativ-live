import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('adegatv_token', data.accessToken);
  await AsyncStorage.setItem('adegatv_refresh', data.refreshToken);
  return data.user;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const { data } = await api.post('/auth/register', { name, email, password });
  await AsyncStorage.setItem('adegatv_token', data.accessToken);
  await AsyncStorage.setItem('adegatv_refresh', data.refreshToken);
  return data.user;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove(['adegatv_token', 'adegatv_refresh']);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('adegatv_token');
}
