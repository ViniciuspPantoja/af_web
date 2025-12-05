const express = require('express');
const router = express.Router();
const Transacao = require('../models/Transacao');

// GET - Listar todas as transações
router.get('/', async (req, res) => {
  try {
    const { categoria, tipo } = req.query;
    const filter = {};
    
    if (categoria) {
      filter.categoria = categoria;
    }
    
    if (tipo) {
      filter.tipo = tipo;
    }
    
    const transacoes = await Transacao.find(filter).sort({ data: -1 });
    console.log(transacoes);
    res.json(transacoes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Obter uma transação por id
router.get('/:id', async (req, res) => {
  try {
    const transacao = await Transacao.findById(req.params.id);
    if (!transacao) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    res.json(transacao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Função auxiliar para converter data de texto para Date
const parseDate = (dateString) => {
  if (!dateString) return new Date();
  
  
  const ddmmyyyy = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
  }
  
  const yyyymmdd = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) {
    return new Date(dateString);
  }
  
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Se não conseguir, retorna data atual
  return new Date();
};

// POST - Criar nova transação
router.post('/', async (req, res) => {
  try {
    const { tipo, categoria, descricao, valor, data } = req.body;
    
    if (!tipo || !categoria || !descricao || valor === undefined) {
      return res.status(400).json({ message: 'Campos obrigatórios: tipo, categoria, descricao, valor' });
    }
    
    const transacao = new Transacao({
      tipo,
      categoria,
      descricao,
      valor,
      data: parseDate(data)
    });
    
    const savedTransacao = await transacao.save();
    res.status(201).json(savedTransacao);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Atualizar transação
router.put('/:id', async (req, res) => {
  try {
    const { tipo, categoria, descricao, valor, data } = req.body;
    
    const transacao = await Transacao.findById(req.params.id);
    if (!transacao) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    if (tipo) transacao.tipo = tipo;
    if (categoria) transacao.categoria = categoria;
    if (descricao) transacao.descricao = descricao;
    if (valor !== undefined) transacao.valor = valor;
    if (data) transacao.data = parseDate(data);
    
    const updatedTransacao = await transacao.save();
    res.json(updatedTransacao);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const transacao = await Transacao.findById(req.params.id);
    if (!transacao) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    
    await Transacao.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Obter saldo total (sempre calcula todas as transações, sem filtros)
router.get('/saldo/total', async (req, res) => {
  try {
    // Usar agregação do MongoDB para calcular o saldo total
    // Isso garante que sempre retorna o saldo de TODAS as transações, independente de filtros
    const result = await Transacao.aggregate([
      {
        $group: {
          _id: null,
          receitas: {
            $sum: {
              $cond: [{ $eq: ['$tipo', 'receita'] }, '$valor', 0]
            }
          },
          despesas: {
            $sum: {
              $cond: [{ $eq: ['$tipo', 'despesa'] }, '$valor', 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          saldo: { $subtract: ['$receitas', '$despesas'] }
        }
      }
    ]);
    
    // Se não houver transações, retorna saldo 0
    const saldo = result.length > 0 ? result[0].saldo : 0;
    res.json({ saldo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

