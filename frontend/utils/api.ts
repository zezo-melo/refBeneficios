import axios from 'axios';
import { INDICATORS_BFF_URL } from '../constants';

// Instância exclusiva para os Indicadores
const apiBFF = axios.create({
  baseURL: INDICATORS_BFF_URL,
});

export const getNewToken = async () => {
  try {
    console.log("🔐 [getNewToken] Iniciando autenticação no BFF...");
    
    const apiKey = process.env.EXPO_PUBLIC_API_KEY;
    console.log("🔑 [getNewToken] API_KEY definida?", !!apiKey);
    console.log("🔑 [getNewToken] Primeiros chars:", apiKey?.substring(0, 10));

    if (!apiKey) {
      console.error("❌ [getNewToken] API_KEY não definida no .env");
      return null;
    }

    console.log("📍 [getNewToken] URL do BFF:", INDICATORS_BFF_URL);
    console.log("🔐 [getNewToken] Enviando POST para /api/auth/apikey...");
    
    const response = await apiBFF.post('/api/auth/apikey', {}, {
      headers: { 'X-API-KEY': apiKey }
    });

    console.log("✅ [getNewToken] Resposta recebida:", response.data);
    
    // A resposta retorna "appToken", não "token"
    const token = response.data?.appToken || response.data?.token || response.data?.jwt;
    
    console.log("🔍 [getNewToken] Token encontrado?", !!token);
    console.log("🔍 [getNewToken] Token (primeiros chars):", token?.substring(0, 20) + "...");
    
    if (!token) {
      console.error("❌ [getNewToken] Token não encontrado na resposta:", response.data);
      return null;
    }

    console.log("✅ [getNewToken] Token obtido com sucesso!");
    return token;
  } catch (error: any) {
    console.error("❌ [getNewToken] ERRO na autenticação");
    console.error("❌ [getNewToken] Status:", error.response?.status);
    console.error("❌ [getNewToken] Dados:", error.response?.data);
    console.error("❌ [getNewToken] Mensagem:", error.message);
    console.error("❌ [getNewToken] Stack:", error.stack);
    return null;
  }
};

export default apiBFF;