import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_URL } from '../constants/index_osm';
import { getNewToken } from '../utils/api';

const apiMentorh = axios.create({ baseURL: API_URL });
const AuthContext = createContext<any>({});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para definir o cabeçalho de autorização para a instância apiMentorh
  const setApiAuthorizationHeader = (token: string | null) => {
    if (token) {
      apiMentorh.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ [AuthContext] Authorization header set:', apiMentorh.defaults.headers.common['Authorization']);
    } else {
      delete apiMentorh.defaults.headers.common['Authorization'];
      console.log('❌ [AuthContext] Authorization header cleared.');
    }
  };

  const refreshBFFToken = async () => {
    const bffToken = await getNewToken();
    if (bffToken) {
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
        setApiAuthorizationHeader(token); // Usar a nova função
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
      setApiAuthorizationHeader(token); // Usar a nova função

      const profile = await apiMentorh.get('/profile');
      await AsyncStorage.setItem('@AppBeneficios:user', JSON.stringify(profile.data));

      await refreshBFFToken();

      setUser(profile.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro no login');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await apiMentorh.post('/auth/register', userData);
      console.log('✅ [AuthContext - signUp] Resposta da API de registro:', response.data);
      // A API de registro não retorna um token JWT.
      // Após o cadastro, o usuário deve ser redirecionado para a tela de login.
      // Nenhuma ação de salvar token ou perfil deve ser feita aqui.
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso! Por favor, faça login.');
    } catch (error: any) {
      if (!error.response?.data?.message) {
        console.error('Erro desconhecido durante o cadastro:', error);
      }
      throw new Error(error.response?.data?.message || 'Erro no cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['@AppBeneficios:token', '@AppBeneficios:user', '@AppBeneficios:bffToken']);
    setUser(null);
    setApiAuthorizationHeader(null); // Limpar o cabeçalho ao fazer logout
  };

  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@AppBeneficios:token'); // Obter o token mais recente
      setApiAuthorizationHeader(token); // Garantir que o cabeçalho está atualizado antes da chamada
      
      const response = await apiMentorh.get('/profile');
      const updatedUser = response.data;
      await AsyncStorage.setItem('@AppBeneficios:user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ [AuthContext - refreshProfile] Authorization header on refresh:', apiMentorh.defaults.headers.common['Authorization']);
      return updatedUser;
    } catch (error) {
      console.error('Erro ao recarregar perfil:', error);
      signOut(); // Força logout se o token estiver inválido ao tentar recarregar o perfil
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updatedData: any) => {
    setIsLoading(true);
    try {
      // Assuming your API has an endpoint like '/profile' for updating user data
      const response = await apiMentorh.put('/profile', updatedData);
      const updatedUser = response.data;

      await AsyncStorage.setItem('@AppBeneficios:user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(error.response?.data?.message || 'Falha ao atualizar perfil.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut, signUp, updateProfile, refreshProfile, apiMentorh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);