// src/routes/curriculumRoutes.js

const Router = require('express').Router; 
const authMiddleware = require('../middleware/authMiddleware');
const { getCurriculum } = require('../controllers/CurriculumController.js'); 

const router = Router();

// Mapeia a URL final /api/users/curriculum/me para a função getCurriculum
// Protegido por autenticação: usa o usuário logado (req.user / req.userId)
router.get('/curriculum/me', authMiddleware, getCurriculum); 

module.exports = router;