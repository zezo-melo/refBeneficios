import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_URL } from '../constants';
import { getNewToken } from '../utils/api';

const apiMentorh = axios.create({ baseURL: API_URL });
const AuthContext = createContext<any>({});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBFFToken = async () => {
    const bffToken = await getNewToken();
    if (bffToken) {
      // Limpa aspas antes de salvar
      const cleanToken = bffToken.replace(/"/g, '');
      await AsyncStorage.setItem('@AppBeneficios:bffToken', cleanToken);
      console.log('✅ [AuthContext] JWT do Indicadores salvo.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const token = await AsyncStorage.getItem('@AppBeneficios:token');
      const userData = await AsyncStorage.getItem('@AppBeneficios:user');
      if (token && userData) {
        setUser(JSON.parse(userData));
        apiMentorh.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        refreshBFFToken();
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const signIn = async (credentials: any) => {
    setIsLoading(true);
    try {
      const response = await apiMentorh.post('/auth/login', credentials);
      const { token } = response.data;
      await AsyncStorage.setItem('@AppBeneficios:token', token);
      apiMentorh.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const profile = await apiMentorh.get('/profile');
      await AsyncStorage.setItem('@AppBeneficios:user', JSON.stringify(profile.data));

      // Busca o token do Felipe IMEDIATAMENTE
      await refreshBFFToken();

      setUser(profile.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro no login');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['@AppBeneficios:token', '@AppBeneficios:user', '@AppBeneficios:bffToken']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);