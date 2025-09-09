// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para cadastro de usuário
router.post('/register', authController.register);

// Rota para login de usuário
router.post('/login', authController.login);

// Rota para buscar o perfil do usuário logado
// O authMiddleware vai verificar o token antes de permitir o acesso
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
