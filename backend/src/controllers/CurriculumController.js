// src/controllers/CurriculumController.js

const User = require('../models/User');

/**
 * Endpoint: GET /api/v1/users/curriculum/me
 * Retorna todos os dados formatados para a tela de Currículo/Painel.
 */
const getCurriculum = async (req, res) => {
    try {
        // Identifica o usuário logado a partir do token (authMiddleware)
        const userId = req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // --- MONTA OS DADOS DO PERFIL A PARTIR DO USUÁRIO LOGADO ---
        const profile = {
            name: user.name,
            role: user.role || 'Colaborador',
            medal: user.medal || (user.points >= 200 ? 'Ouro' : user.points >= 100 ? 'Prata' : 'Bronze'),
            productivity_today_pts: typeof user.productivityTodayPts === 'number' ? user.productivityTodayPts : (user.points || 0),
            productivity_30d_avg: typeof user.productivity30dAvg === 'number' ? user.productivity30dAvg : 0,
            active_calls: typeof user.activeCalls === 'number' ? user.activeCalls : 0,
            avatar_url: user.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'Usuário'),
        };

        // --- POR ENQUANTO, MANTEMOS JORNADA / KPIs / GRÁFICOS MOCKADOS ---
        // Estes blocos podem ser substituídos depois por consultas reais de produtividade, chamados, etc.
        const mockData = {
            profile,
            jornada: {
                first_log: "08:07",
                last_log: "16:52",
                hours_logged: "7h 41min",
                pause_time: "0h 38min",
                jornada_status: "Jornada adequada"
            },
            kpis: [
                { label: "Chamados recebidos hoje", value: "18", sub_label: "Encerrados: 16", tag_color: "good" },
                { label: "Idade média dos chamados", value: "3,2 dias", sub_label: "Meta: ≤ 4 dias", tag_color: "good" },
                { label: "SLA pessoal (30d)", value: "93%", sub_label: "Meta: ≥ 90%", tag_color: "good" },
                { label: "Risco de glosa estimado", value: "Baixo · 7%", sub_label: "2 chamados monitorados", tag_color: "mid" }
            ],
            ocorrencias: [
                { id: 'DM-8421', cliente: 'Prefeitura A', modulo: 'Folha', status: 'Em análise (N1)', sla: 'SLA 80% · 1d', risco: 'Médio', risco_tag: 'risk-medio' },
                { id: 'DM-8479', cliente: 'Prefeitura B', modulo: 'Mensageria', status: 'Na fila N2', sla: 'SLA 95% · 3d', risco: 'Baixo', risco_tag: 'risk-baixo' },
                { id: 'DM-8533', cliente: 'Estado X', modulo: 'Carreira', status: 'Em homologação', sla: 'SLA 60% · vencido', risco: 'Alto', risco_tag: 'risk-alto' },
                { id: 'DM-8597', cliente: 'Câmara Y', modulo: 'Ponto', status: 'Aguardando cliente', sla: 'SLA pausado', risco: 'Baixo', risco_tag: 'risk-baixo' },
                { id: 'DM-8620', cliente: 'Prefeitura A', modulo: 'Benefícios', status: 'Em análise (N2)', sla: 'SLA 92% · 4d', risco: 'Baixo', risco_tag: 'risk-baixo' },
                { id: 'DM-8654', cliente: 'Estado X', modulo: 'Mensageria', status: 'Na fila N1', sla: 'SLA 98% · 2d', risco: 'Baixo', risco_tag: 'risk-baixo' }
            ],
            charts: {
                tempo_operador: {
                    labels: ['Thais', 'Carlos', 'Marina', 'João', 'Patrícia', 'Rafael'],
                    data: [3.4, 4.2, 3.9, 4.5, 4.0, 4.3],
                    user_index: 0
                },
                status_distribuicao: {
                    labels: ['Na fila', 'Em análise', 'Aguardando cliente', 'Em homologação'],
                    data: [4, 6, 2, 2],
                    backgroundColor: ['#94a3b8', '#38bdf8', '#facc15', '#22c55e']
                }
            }
        };
        
        // Retorna o JSON com status 200 (OK)
        return res.status(200).json(mockData);
        
    } catch (error) {
        console.error("Erro ao buscar currículo do usuário:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// Exporta usando a sintaxe CommonJS
module.exports = {
    getCurriculum,
};