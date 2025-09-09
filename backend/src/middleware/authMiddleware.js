const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supercalifragilisticexpialidocious_12345'; 

module.exports = (req, res, next) => {
    // Pegar o token do cabeçalho da requisição
    const token = req.header('Authorization');

    // Se não houver token, o acesso é negado
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        // Verificar e decodificar o token
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);

        // Adicionar o ID do usuário na requisição para ser usado nas rotas protegidas
        req.userId = decoded.id;
        
        // Passar para o próximo middleware ou para a rota
        next();
    } catch (error) {
        // Se o token for inválido, o acesso é negado
        res.status(401).json({ message: 'Token inválido.' });
    }
};
