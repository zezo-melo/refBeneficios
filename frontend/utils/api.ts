import axios from 'axios';
import { INDICATORS_BFF_URL } from '../constants/index_osm';

export const getNewToken = async () => {
  try {
    // Chave pura, sem chances de erro de leitura de .env
    const apiKey = "f9z$2bA#8kLpQ7jd#4r32!@@sW5v!c3gH*rE6tY";
    
    console.log("🔐 [getNewToken] Tentativa com chave manual via Axios Puro...");

    // Usando axios direto para evitar configurações de instância que possam estar viciadas
    const response = await axios({
      method: 'post',
      url: `${INDICATORS_BFF_URL}/api/auth/apikey`,
      headers: {
        'X-API-KEY': apiKey.trim(), // .trim() remove qualquer espaço acidental
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: {} // Alguns servidores exigem corpo vazio {} em POST
    });

    const token = response.data?.appToken || response.data?.token || response.data?.jwt;
    
    if (token) {
      console.log("✅ [getNewToken] SUCESSO! Token recebido.");
      return token;
    }
    
    return null;
  } catch (error: any) {
    // LOG DETALHADO PARA O FELIPE
    console.error("❌ [getNewToken] Erro Status:", error.response?.status);
    console.error("❌ [getNewToken] Mensagem do Servidor:", error.response?.data);
    return null;
  }
};