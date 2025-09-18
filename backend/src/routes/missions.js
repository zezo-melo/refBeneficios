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