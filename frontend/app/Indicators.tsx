import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INDICATORS_BFF_URL } from '../constants/index_osm';
import Header from '../components/Header';

export default function IndicatorsScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@AppBeneficios:bffToken');
      if (!token) {
        console.log("❌ Sem token no storage");
        return;
      }

      const cleanToken = token.replace(/"/g, '');
      console.log("📡 Chamando dashboard com token:", cleanToken.substring(0, 10));

      const response = await axios.get(`${INDICATORS_BFF_URL}/api/dashboard-data`, {
        headers: { 'Authorization': `Bearer ${cleanToken}` }
      });
      setData(response.data);
    } catch (err: any) {
      console.error("❌ Erro 403/401 na tela:", err.response?.status);
      if (err.response?.status === 403) {
        Alert.alert("Erro 403", "O servidor barrou o token. Tente relogar.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.padding}>
        <Text style={styles.title}>Resultados</Text>
        {data ? <Text style={styles.json}>{JSON.stringify(data, null, 2)}</Text> : <Text>Sem dados.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  padding: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32' },
  json: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 5, fontSize: 12, marginTop: 10 }
});