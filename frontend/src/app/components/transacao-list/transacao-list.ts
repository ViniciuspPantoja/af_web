import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';

@Component({
  selector: 'app-transacao-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './transacao-list.html',
  styleUrl: './transacao-list.css',
})
export class TransacaoList implements OnInit {
  transacoes: Transacao[] = [];
  filteredTransacoes: Transacao[] = [];
  selectedCategoria: string = '';
  selectedTipo: string = '';
  categorias: string[] = [];

  constructor(
    private transacaoService: TransacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTransacoes();
    window.addEventListener('transacaoUpdated', () => {
      this.loadTransacoes();
    });
  }

  loadTransacoes(): void {
    this.transacaoService.getTransacoes().subscribe({
      next: (data) => {
        this.transacoes = data;
        this.filteredTransacoes = data;
        this.extractCategorias();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar transações:', error);
        this.transacoes = [];
        this.filteredTransacoes = [];
        this.cdr.detectChanges();
      }
    });
  }

  extractCategorias(): void {
    const categoriasSet = new Set<string>();
    this.transacoes.forEach(t => categoriasSet.add(t.categoria));
    this.categorias = Array.from(categoriasSet).sort();
  }

  onFilterChange(): void {
    this.transacaoService.getTransacoes(
      this.selectedCategoria || undefined,
      this.selectedTipo || undefined
    ).subscribe({
      next: (data) => {
        this.filteredTransacoes = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao filtrar transações:', error);
        this.cdr.detectChanges();
      }
    });
  }

  onEdit(transacao: Transacao): void {
    const event = new CustomEvent('editTransacao', {
      detail: transacao
    });
    window.dispatchEvent(event);
    
    const formElement = document.querySelector('app-transacao-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onDelete(id: string | undefined): void {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      this.transacaoService.deleteTransacao(id).subscribe({
        next: () => {
          window.location.reload();
        },
        error: (error) => {
          console.error('Erro ao deletar transação:', error);
          alert('Erro ao deletar transação');
        }
      });
    }
  }

  getTransacaoClass(transacao: Transacao): string {
    return transacao.tipo === 'receita' ? 'receita' : 'despesa';
  }

  getCategoriaClass(categoria: string): string {
    // Retorna uma classe CSS baseada na categoria (para estilização)
    const categoriaLower = categoria.toLowerCase().replace(/\s+/g, '-');
    return `categoria-${categoriaLower}`;
  }

  getCategoriaColor(categoria: string): string {
    // Mapa de cores para cada categoria
    const coresCategorias: { [key: string]: string } = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Moradia': '#45B7D1',
      'Saúde': '#96CEB4',
      'Educação': '#FFEAA7',
      'Lazer': '#DDA0DD',
      'Salário': '#98D8C8',
      'Freelance': '#F7DC6F',
      'Investimentos': '#85C1E2',
      'Outros': '#BDC3C7'
    };
    
    // Retorna a cor da categoria ou uma cor padrão
    return coresCategorias[categoria] || '#95A5A6';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    let dateStr = '';
    if (typeof date === 'string') {
      dateStr = date;
    } else {
      dateStr = date.toISOString();
    }
    
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateStr;
    }
    
    let datePart = '';
    if (dateStr.includes('T')) {
      datePart = dateStr.split('T')[0];
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      datePart = dateStr.substring(0, 10);
    } else {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return '';
    }
    
    if (datePart) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return '';
  }
}

