require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const transacaoRoutes = require('./routes/transacoes');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/transacoes', transacaoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Gestor Financeiro Pessoal' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
