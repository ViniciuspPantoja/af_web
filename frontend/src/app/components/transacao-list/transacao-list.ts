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
    // Carregar lista imediatamente ao inicializar o componente
    this.loadTransacoes();
    // Recarregar lista quando uma transação for atualizada
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
        // detecta as mudanças na pagina e recarrega os dados
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
        // Forçar detecção de mudanças após filtrar
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao filtrar transações:', error);
        this.cdr.detectChanges();
      }
    });
  }

  onEdit(transacao: Transacao): void {
    // Emitir evento customizado para carregar a transação no formulário
    const event = new CustomEvent('editTransacao', {
      detail: transacao
    });
    window.dispatchEvent(event);
    
    // Scroll suave até o formulário
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
          // Recarregar a página para atualizar os resultados
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

  formatDate(date: Date | string | undefined): string {
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
      const d = new Date(date);
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
}

