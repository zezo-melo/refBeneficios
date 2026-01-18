import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Alert
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INDICATORS_BFF_URL } from '../../constants';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

const screenWidth = Dimensions.get('window').width;

interface Ticket {
  'N° Chamado': string;
  'Data de Criação': string;
  'Data de Finalização'?: string;
  'Fantasia': string;
  'Nome do Status': string;
  'Nome Completo do Operador': string;
  'Nome do Grupo': string;
  'SLA de Solução': string;
  'Tipo de Ocorrência': string;
  'Módulo': string;
}

interface DashboardData {
  tickets: Ticket[];
  userMetrics?: any;
}

const COLORS = {
  primary: '#4a7f37',
  primaryDark: '#2e7d32',
  primaryLight: '#66bb6a',
  secondary: '#1a5d2b',
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  textLight: '#757575',
  border: '#e0e0e0',
  error: '#d32f2f',
  warning: '#ffa000',
  success: '#388e3c',
  info: '#1976d2',
};

const CHART_COLORS = ['#0084FF', '#7B68EE', '#FF9800', '#E91E63', '#4CAF50', '#9C27B0'];

const Indicators: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const bffToken = await AsyncStorage.getItem('@AppBeneficios:bffToken');
      
      console.log("📱 [Indicators] Token armazenado:", bffToken ? `${bffToken.substring(0, 20)}...` : "NÃO ENCONTRADO");

      if (!bffToken) {
        throw new Error('Token não encontrado.');
      }

      console.log("🔄 [Indicators] Buscando dashboard-data...");
      const response = await axios.get(`${INDICATORS_BFF_URL}/api/dashboard-data`, {
        headers: {
          'Authorization': `Bearer ${bffToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ [Indicators] Dados recebidos!");
      setDashboardData(response.data);
    } catch (err: any) {
      console.error('❌ [Indicators] Erro:', err.message);
      const msg = err.response?.data?.message || err.message || 'Erro ao carregar dados.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!dashboardData || !dashboardData.tickets) return null;
    const tickets = dashboardData.tickets;
    const total = tickets.length;
    const emAberto = tickets.filter(t => t['Nome do Status'] !== 'Finalizado' && t['Nome do Status'] !== 'Resolvido').length;
    const slaPercentual = total > 0 ? Math.round((tickets.filter(t => t['SLA de Solução'] === 'No Prazo').length / total) * 100) : 0;
    const chamadosExecutados = tickets.filter(t => t['Nome do Status'] === 'Finalizado' || t['Nome do Status'] === 'Resolvido').length;
    
    return { total, emAberto, slaPercentual, chamadosExecutados };
  }, [dashboardData]);

  // Contar status para gráfico
  const statusDistribution = useMemo(() => {
    if (!dashboardData || !dashboardData.tickets) return null;
    const statusMap = new Map<string, number>();
    
    dashboardData.tickets.forEach(ticket => {
      const status = ticket['Nome do Status'];
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    
    return Array.from(statusMap.entries()).map(([key, value]) => ({
      name: key.substring(0, 10),
      value: value,
      color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)],
      legendName: key
    }));
  }, [dashboardData]);

  // Primeiros 5 tickets para a tabela
  const tableData = useMemo(() => {
    if (!dashboardData || !dashboardData.tickets) return [];
    return dashboardData.tickets.slice(0, 5);
  }, [dashboardData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando indicadores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header />
      <View style={styles.content}>
        {/* HEADER DO USUÁRIO */}
        {user && (
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            </View>
            
            <Text style={styles.userName}>{user.name || 'Usuário'}</Text>
            <Text style={styles.userRole}>Colaborador - Atendimento 1º Nível</Text>
            
            <View style={styles.rankingRow}>
              <View style={styles.rankingCard}>
                <Text style={styles.rankingLabel}>Ranking</Text>
                <Text style={styles.rankingValue}>#7</Text>
              </View>
              <View style={styles.rankingCard}>
                <Text style={styles.rankingLabel}>Nível</Text>
                <Text style={styles.rankingValue}>Bronze</Text>
              </View>
            </View>
            
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats?.chamadosExecutados || 0}</Text>
                <Text style={styles.metricLabel}>Chamados Abertos</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats?.slaPercentual || 0}%</Text>
                <Text style={styles.metricLabel}>SLA</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>2780</Text>
                <Text style={styles.metricLabel}>Produtividade</Text>
              </View>
            </View>
          </View>
        )}

        {/* RESUMO */}
        {stats && (
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { borderLeftColor: COLORS.info }]}>
              <Text style={styles.summaryValue}>{stats.total}</Text>
              <Text style={styles.summaryLabel}>Total de Chamados</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: COLORS.warning }]}>
              <Text style={styles.summaryValue}>{stats.emAberto}</Text>
              <Text style={styles.summaryLabel}>Em Aberto</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: COLORS.success }]}>
              <Text style={styles.summaryValue}>{stats.slaPercentual}%</Text>
              <Text style={styles.summaryLabel}>SLA</Text>
            </View>
          </View>
        )}

        {/* PRODUTIVIDADE & STATUS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Produtividade & Status</Text>
          <View style={styles.productivityRow}>
            <View style={styles.productivityCard}>
              <Text style={styles.productivityLabel}>Chamados Executados</Text>
              <Text style={styles.productivityValue}>278</Text>
            </View>
            <View style={styles.productivityCard}>
              <Text style={styles.productivityLabel}>Idade Média</Text>
              <Text style={styles.productivityValue}>7.9 dias</Text>
            </View>
            <View style={styles.productivityCard}>
              <Text style={styles.productivityLabel}>Críticas (>? dias)</Text>
              <Text style={[styles.productivityValue, { color: COLORS.error }]}>3</Text>
            </View>
          </View>
        </View>

        {/* DISTRIBUIÇÃO DE STATUS */}
        {statusDistribution && statusDistribution.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Distribuição de Status</Text>
            <View style={{ alignItems: 'center' }}>
              <PieChart
                data={statusDistribution}
                width={screenWidth - 40}
                height={200}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: () => '#000',
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
              />
            </View>
            <View style={styles.legendContainer}>
              {statusDistribution.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.legendName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TABELA DE OCORRÊNCIAS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ocorrências do dia - N1/N2</Text>
          <Text style={styles.tableDescription}>
            Histórico das ocorrências com status, datas, SLA, risco de glosa e estimativa de fechamento com base em histórico.
          </Text>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 0.5, color: COLORS.primary, fontWeight: 'bold' }]}>ID</Text>
            <Text style={[styles.tableCell, { flex: 1.5, color: COLORS.primary, fontWeight: 'bold' }]}>CLIENTE</Text>
            <Text style={[styles.tableCell, { flex: 1, color: COLORS.primary, fontWeight: 'bold' }]}>MÓDULO</Text>
            <Text style={[styles.tableCell, { flex: 1.5, color: COLORS.primary, fontWeight: 'bold' }]}>STATUS</Text>
          </View>
          
          {tableData.map((ticket, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{ticket['N° Chamado']?.substring(0, 5)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{ticket['Fantasia']?.substring(0, 15)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{ticket['Módulo']?.substring(0, 8)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{ticket['Nome do Status']}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.textLight },
  content: { padding: 16 },
  errorContainer: { padding: 20, alignItems: 'center', marginTop: 50 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.error, marginBottom: 10 },
  errorText: { textAlign: 'center', color: COLORS.textLight, marginBottom: 20 },
  retryButton: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },

  // USER HEADER
  userHeader: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center', elevation: 2 },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  userRole: { fontSize: 12, color: COLORS.textLight, marginBottom: 12 },
  rankingRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12, gap: 12 },
  rankingCard: { backgroundColor: COLORS.background, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  rankingLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 4 },
  rankingValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 12 },
  metricCard: { alignItems: 'center', flex: 1 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  metricLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 4, textAlign: 'center' },

  // SUMMARY
  summaryContainer: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  summaryCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, borderLeftWidth: 4, elevation: 2 },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },

  // SECTION
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },

  // PRODUCTIVITY
  productivityRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  productivityCard: { flex: 1, backgroundColor: COLORS.background, padding: 12, borderRadius: 10, alignItems: 'center' },
  productivityLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 8 },
  productivityValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },

  // LEGEND
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 11, color: COLORS.text },

  // TABLE
  tableDescription: { fontSize: 11, color: COLORS.textLight, marginBottom: 12, lineHeight: 16 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: 12, marginBottom: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableCell: { fontSize: 11, color: COLORS.text, paddingHorizontal: 4 },
});

export default Indicators;