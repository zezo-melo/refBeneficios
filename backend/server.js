// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/app_beneficios';

mongoose.connect(mongoUri)
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro de conexão com o MongoDB:', err));

// Importa as rotas de autenticação, perfil e missões
const authRoutes = require('./src/routes/auth.js');
const profileRoutes = require('./src/routes/profile.js'); 
const missionsRoutes = require('./src/routes/missions.js'); // Importe a nova rota

// Adiciona as rotas ao seu aplicativo
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/missions', missionsRoutes); // Adicione esta linha crucial aqui

app.get('/', (req, res) => {
  res.send('Servidor de autenticação funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});