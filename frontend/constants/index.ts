import { Platform } from 'react-native';

// Objeto de configuração para URLs da API
export const API_CONFIG = {
  // A URL base da sua API sem o caminho de rota
  emulator: 'http://10.0.2.2:3000/api', 
  // Para testar em um celular na mesma rede local que o seu PC.
  // IMPORTANTE: Substitua '172.17.1.103' pelo IP do seu próprio computador.
  localNetwork: 'https://api-conhecimentos.mentorh.com/api',
  // Para o seu backend hospedado no Vercel
  // Aqui apontamos para a API em produção já com o prefixo /api,
  // pois o seu backend monta as rotas como /api/auth, /api/profile, etc.
  vercel: 'https://api-conhecimentos.mentorh.com/api',
  // Para usar com tunnel do Expo (funciona em qualquer rede)
  tunnel: 'https://api-conhecimentos.mentorh.com/api',
};

// Configuração automática baseada na plataforma
const getApiUrl = () => {
  // 1) Permite override via variável de ambiente do Expo (app.config, eas, etc)
  // @ts-ignore - process.env pode não estar tipado aqui
  const envUrl = process?.env?.EXPO_PUBLIC_API_URL || process?.env?.API_URL;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl;
  }

  // Em desenvolvimento no iOS, prefira a rede local (o Expo permite HTTP para LAN)
  if (__DEV__ && Platform.OS === 'ios') {
    return API_CONFIG.localNetwork;
  }
  
  // Para dispositivos físicos, use localNetwork
  if (__DEV__) {
    return API_CONFIG.localNetwork;
  }
  
  // Para produção, use vercel
  return API_CONFIG.vercel;
};

// A URL base que aponta para o seu backend.
export const API_URL = getApiUrl();

// Configuração adicional para iOS
export const IOS_CONFIG = {
  // Timeout maior para iOS (mais lento em desenvolvimento)
  timeout: 30000,
  // Headers específicos para iOS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};
