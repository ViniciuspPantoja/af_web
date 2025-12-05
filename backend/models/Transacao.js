const mongoose = require('mongoose');

const transacaoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['receita', 'despesa']
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  data: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transacao', transacaoSchema);

