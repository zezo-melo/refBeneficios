// backend/src/routes/profile.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Certifique-se de que o caminho está correto
const User = require('../models/User'); // Certifique-se de que o caminho está correto

// Rota GET para buscar o perfil do usuário logado
router.get('/', authMiddleware, async (req, res) => {
  try {
    // req.user.id é definido pelo seu middleware de autenticação
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro do servidor.' });
  }
});

// Rota PUT para atualizar o perfil do usuário
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, dob, docType, document, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, dob, docType, document, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro do servidor.' });
  }
});

module.exports = router;