import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Simulação de AsyncStorage para o ambiente do Canvas
const asyncStorage = {
  data: {},
  getItem: async (key) => asyncStorage.data[key] || null,
  setItem: async (key, value) => { asyncStorage.data[key] = value; },
  removeItem: async (key) => { delete asyncStorage.data[key]; },
};

// Simulação de Alert para o ambiente do Canvas
const Alert = {
  alert: (title, message) => {
    console.log(`ALERTA: ${title}\n${message}`);
  }
};

// Objeto de configuração para URLs da API
const API_CONFIG = {
  // A URL base da sua API sem o caminho de rota
  emulator: 'http://10.0.2.2:3000/api', 
  // Para testar em um celular na mesma rede local que o seu PC
  localNetwork: 'http://192.168.1.15:3000/api',
  // Para o seu backend hospedado no Vercel
  vercel: 'https://seu-backend-incrivel.vercel.app/api',
};

// A URL base que aponta para o seu backend
const API_URL = API_CONFIG.emulator; 

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  points: number;
  missions: number;
  profile?: { 
    name: string;
    dob: string;
    docType: string;
    document: string;
    phone: string;
  };
}

interface UserRegistrationData {
  name: string;
  email: string;
  dob: Date;
  docType: string;
  document: string;
  phone: string;
  password: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: UserRegistrationData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User['profile']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@AppBeneficios:token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        // Faz a chamada para a rota de perfil correta no backend
        const response = await axios.get(`${API_URL}/profile`);
        setUser(response.data);
      }
    } catch (error) {
      console.log('Erro ao carregar usuário:', error.response?.data || error.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Faz a chamada para a rota de login no backend
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token } = response.data;
  
      await AsyncStorage.setItem('@AppBeneficios:token', token);
  
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
      // Busca os dados do usuário logado na rota de perfil
      const profileResponse = await axios.get(`${API_URL}/profile`);
      setUser(profileResponse.data);
  
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw new Error('Falha na autenticação. Verifique seu email e senha.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('@AppBeneficios:token');
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.log('Erro no logout:', error);
    }
  };

  const signUp = async (data: UserRegistrationData) => {
    setIsLoading(true);
    try {
      // Faz a chamada para a rota de registro no backend
      const response = await axios.post(`${API_URL}/auth/register`, data);
      Alert.alert('Sucesso', response.data.message);
    } catch (error) {
      console.error('Erro no cadastro:', error.response?.data || error.message);
      throw new Error('Falha no cadastro. Verifique os dados ou tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    setIsLoading(true);
    try {
      // Faz a chamada para a rota de atualização de perfil no backend
      const response = await axios.put(`${API_URL}/profile`, profileData);
  
      const updatedUser = response.data;
      setUser(updatedUser);
  
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar o perfil. Tente novamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeMission = async (missionId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/missions/complete-first-mission`, { missionId });

            // Atualiza o estado do usuário com os dados recebidos do backend
            setUser(response.data.user);
            Alert.alert('Sucesso', response.data.message);

            return true; // Retorna true para indicar que a missão foi completada
        } catch (error) {
            console.error('Erro ao completar missão:', error.response?.data || error.message);
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao completar a missão.');
            return false;
        } finally {
            setIsLoading(false);
        }
      };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        completeMission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};