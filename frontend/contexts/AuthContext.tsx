import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_URL } from '../constants';
import { getNewToken } from '../utils/api';

// Instância isolada para a Mentorh
const apiMentorh = axios.create({
  baseURL: API_URL,
});

interface AuthContextData {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBFFToken = async () => {
    try {
      console.log('🔄 [refreshBFFToken] ===== INICIANDO =====');
      
      // MODO MANUAL: Se houver um token no .env, usa direto
      const manualToken = process.env.EXPO_PUBLIC_BFF_TOKEN;
      if (manualToken) {
        console.log('✅ [refreshBFFToken] Token manual encontrado no .env');
        await AsyncStorage.setItem('@AppBeneficios:bffToken', manualToken);
        console.log('✅ [refreshBFFToken] Token manual salvo com sucesso!');
        return;
      }
      
      // MODO AUTOMÁTICO: Tenta obter via API_KEY
      const bffToken = await getNewToken();
      console.log('✅ [refreshBFFToken] getNewToken retornou:', !!bffToken ? "TOKEN" : "NULL");
      
      if (bffToken) {
        console.log('💾 [refreshBFFToken] Tentando salvar token no AsyncStorage...');
        await AsyncStorage.setItem('@AppBeneficios:bffToken', bffToken);
        console.log('✅ [refreshBFFToken] Token salvo com sucesso!');
      } else {
        console.log('❌ [refreshBFFToken] Nenhum token disponível');
      }
    } catch (e) {
      console.log('⚠️ [refreshBFFToken] ERRO ao renovar token do BFF:', e);
    }
  };

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@AppBeneficios:token');
        const storedUser = await AsyncStorage.getItem('@AppBeneficios:user');

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          apiMentorh.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          refreshBFFToken();
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const signIn = async (credentials: any) => {
    setIsLoading(true);
    try {
      console.log('🔐 [signIn] Iniciando login com credenciais...');
      
      // Login usando a instância específica da Mentorh
      const response = await apiMentorh.post('/auth/login', credentials);
      const { token } = response.data;

      console.log('✅ [signIn] Login realizado com sucesso!');
      
      await AsyncStorage.setItem('@AppBeneficios:token', token);
      apiMentorh.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const profileResponse = await apiMentorh.get('/profile');
      const userData = profileResponse.data;

      await AsyncStorage.setItem('@AppBeneficios:user', JSON.stringify(userData));
      
      console.log('🔄 [signIn] Agora tentando obter token do BFF...');
      // Busca o token dos indicadores sem travar o processo
      refreshBFFToken();

      setUser(userData);
      Alert.alert('Sucesso', 'Login realizado!');
    } catch (error: any) {
      console.error('❌ [signIn] Erro:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro no servidor Mentorh');
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