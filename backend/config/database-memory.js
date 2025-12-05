const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDBMemory = async () => {
  try {
    // Criar instância do MongoDB em memória
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB em memória conectado: ${mongoUri}`);
    console.log('⚠️  ATENÇÃO: Banco de dados temporário - dados serão perdidos ao reiniciar');
    
    return conn;
  } catch (error) {
    console.error(`Erro ao conectar MongoDB em memória: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('MongoDB em memória desconectado');
  } catch (error) {
    console.error(`Erro ao desconectar: ${error.message}`);
  }
};

module.exports = { connectDBMemory, disconnectDB };

