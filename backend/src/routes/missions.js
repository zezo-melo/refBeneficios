// backend/src/routes/missions.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Rota para completar a primeira missão
router.post('/complete-first-mission', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const missionPoints = 10;

    // Buscar o usuário pelo ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica se o usuário já tem pontos de perfil preenchido
    if (user.missions > 0) { 
        return res.status(400).json({ message: 'Esta missão já foi completada.' });
    }

    // Atualizar os pontos e o contador de missões do usuário
    user.points += missionPoints;
    user.missions += 1; // Incrementa o contador de missões completadas
    await user.save();

    res.json({
      message: 'Missão completada! Você ganhou ' + missionPoints + ' pontos.',
      user: user, // Retorna os dados atualizados do usuário
    });

  } catch (error) {
    console.error('Erro ao completar missão:', error);
    res.status(500).json({ message: 'Erro do servidor.' });
  }
});

module.exports = router;
 
// Nova rota: completar missão do quiz (Missão 2)
router.post('/complete-quiz-mission', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const missionId = 'quiz2';
    const { correctCount } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Já completou a missão 2?
    if (user.missionsCompleted && user.missionsCompleted.includes(missionId)) {
      return res.status(400).json({ message: 'Esta missão já foi completada.' });
    }

    const safeCorrectCount = Number.isFinite(correctCount) ? Math.max(0, Math.min(10, Number(correctCount))) : 0;
    const missionPoints = Math.min(20, safeCorrectCount * 2);

    user.points += missionPoints;
    user.missionsCompleted = Array.isArray(user.missionsCompleted) ? user.missionsCompleted : [];
    user.missionsCompleted.push(missionId);
    await user.save();

    return res.json({
      message: 'Missão 2 concluída! Você ganhou ' + missionPoints + ' pontos.',
      user,
    });
  } catch (error) {
    console.error('Erro ao completar missão 2:', error);
    return res.status(500).json({ message: 'Erro do servidor.' });
  }
});

// Rota para abrir baú de bônus
router.post('/open-chest', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { chestId, points } = req.body;

    if (!chestId || !points) {
      return res.status(400).json({ message: 'ID do baú e pontos são obrigatórios.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar se o baú já foi aberto
    if (user.chestsOpened && user.chestsOpened.includes(chestId)) {
      return res.status(400).json({ message: 'Este baú já foi aberto.' });
    }

    // Adicionar pontos e marcar baú como aberto
    user.points += points;
    user.chestsOpened = Array.isArray(user.chestsOpened) ? user.chestsOpened : [];
    user.chestsOpened.push(chestId);
    
    await user.save();

    return res.json({
      message: `Baú aberto! Você ganhou ${points} pontos de bônus!`,
      user,
      pointsAwarded: points
    });
  } catch (error) {
    console.error('Erro ao abrir baú:', error);
    return res.status(500).json({ message: 'Erro do servidor.' });
  }
});