// backend/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = 'supercalifragilisticexpialidocious_12345'; 

module.exports = (req, res, next) => {
    // Pegar o token do cabeçalho da requisição
    const authHeader = req.header('Authorization');

    // Se não houver token, o acesso é negado
    if (!authHeader) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }
    
    const token = authHeader.replace('Bearer ', '');

    try {
        // Verificar e decodificar o token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Adicionar o objeto 'user' na requisição com o ID
        // Isso garante que o req.user.id possa ser acessado na rota de perfil
        req.user = { id: decoded.id };
        
        // Passar para o próximo middleware ou para a rota
        next();
    } catch (error) {
        // Se o token for inválido, o acesso é negado
        res.status(401).json({ message: 'Token inválido.' });
    }
};