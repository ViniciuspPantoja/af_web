import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';

@Component({
  selector: 'app-transacao-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './transacao-form.html',
  styleUrl: './transacao-form.css',
})
export class TransacaoForm implements OnInit, OnChanges {
  @Input() transacao: Transacao | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData: Transacao = {
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: 0,
    data: ''
  };

  categoriasComuns = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Salário',
    'Freelance',
    'Investimentos',
    'Outros'
  ];

  constructor(private transacaoService: TransacaoService) {}

  ngOnInit(): void {
    this.loadTransacaoData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reagir a mudanças no Input transacao
    if (changes['transacao'] && !changes['transacao'].firstChange) {
      this.loadTransacaoData();
    }
  }

  private loadTransacaoData(): void {
    if (this.transacao) {
      this.formData = { ...this.transacao };
      if (this.formData.data) {
        // Usar a mesma lógica de formatação da listagem para garantir consistência
        this.formData.data = this.formatDateForInput(this.formData.data);
      }
    } else {
      // Se não há transação, resetar o formulário
      this.resetForm();
    }
  }

  private formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    
    // Extrair apenas a parte da data sem considerar timezone
    let dateStr = '';
    if (typeof date === 'string') {
      dateStr = date;
    } else {
      dateStr = date.toISOString();
    }
    
    // Se já está no formato DD/MM/YYYY, retornar diretamente
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr;
    }
    
    // Extrair apenas a parte da data (YYYY-MM-DD) de uma string ISO
    let datePart = '';
    if (dateStr.includes('T')) {
      datePart = dateStr.split('T')[0]; // Pega YYYY-MM-DD
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      datePart = dateStr.substring(0, 10); // Pega YYYY-MM-DD
    } else {
      // Fallback: usar Date mas extrair componentes locais
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return '';
    }
    
    // Converter de YYYY-MM-DD para DD/MM/YYYY
    if (datePart) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return '';
  }

  onSubmit(): void {
    if (this.formData._id) {
      this.transacaoService.updateTransacao(this.formData._id, this.formData).subscribe({
        next: () => {
          this.saved.emit();
          this.resetForm();
          // Recarregar a página para atualizar os resultados
          window.location.reload();
        },
        error: (error) => {
          console.error('Erro ao atualizar transação:', error);
          alert('Erro ao atualizar transação');
        }
      });
    } else {
      this.transacaoService.createTransacao(this.formData).subscribe({
        next: () => {
          this.saved.emit();
          this.resetForm();
          // Recarregar a página para atualizar os resultados
          window.location.reload();
        },
        error: (error) => {
          console.error('Erro ao criar transação:', error);
          alert('Erro ao criar transação');
        }
      });
    }
  }

  onCancel(): void {
    // Não faz nada, formulário sempre visível
  }

  private resetForm(): void {
    this.formData = {
      tipo: 'receita',
      categoria: '',
      descricao: '',
      valor: 0,
      data: ''
    };
  }
}

