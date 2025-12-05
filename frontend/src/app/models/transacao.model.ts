export interface Transacao {
  _id?: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Saldo {
  saldo: number;
}

