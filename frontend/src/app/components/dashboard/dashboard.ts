import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransacaoService } from '../../services/transacao.service';
import { Saldo } from '../../models/transacao.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  saldo: number = 0;

  constructor(
    private transacaoService: TransacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Carregar saldo direto na hora que carrega o componente
    this.loadSaldo();
    
    // atualizar o saldo sempre qu tiver uma transacao atualizada
    window.addEventListener('transacaoUpdated', () => {
      this.loadSaldo();
    });
  }

  loadSaldo(): void {
    this.transacaoService.getSaldo().subscribe({
      next: (response: Saldo) => {
        this.saldo = response.saldo || 0;
       // atualiando a pagina com os novos dados
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar saldo:', error);
        this.saldo = 0;
        this.cdr.detectChanges();
      }
    });
  }
}
