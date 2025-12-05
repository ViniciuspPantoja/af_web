require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDBMemory } = require('./config/database-memory');
const transacaoRoutes = require('./routes/transacoes');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB em memória
connectDBMemory();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/transacoes', transacaoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Gestor Financeiro Pessoal',
    database: 'MongoDB em Memória (Temporário)',
    warning: 'Os dados serão perdidos ao reiniciar o servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  const { disconnectDB } = require('./config/database-memory');
  await disconnectDB();
  process.exit(0);
});
