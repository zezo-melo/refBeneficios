import { Platform } from 'react-native';

export const API_CONFIG = {
  vercel: 'https://api-conhecimentos.mentorh.com/api',
};

const getApiUrl = () => {
  const envUrl = process?.env?.EXPO_PUBLIC_API_URL || process?.env?.API_URL;
  if (envUrl && typeof envUrl === 'string') return envUrl;
  return API_CONFIG.vercel;
};

export const API_URL = getApiUrl();

// NOVA CONSTANTE PARA O FELIPE
export const INDICATORS_BFF_URL = 'https://bff-indicadores-51uk.onrender.com';

export const IOS_CONFIG = {
  timeout: 15000,
};