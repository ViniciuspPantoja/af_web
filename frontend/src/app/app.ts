import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Dashboard } from './components/dashboard/dashboard';
import { TransacaoForm } from './components/transacao-form/transacao-form';
import { TransacaoList } from './components/transacao-list/transacao-list';
import { TransacaoService } from './services/transacao.service';
import { Transacao } from './models/transacao.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Dashboard, TransacaoForm, TransacaoList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Gestor Financeiro Pessoal';
  editingTransacao: Transacao | null = null;

  constructor(private transacaoService: TransacaoService) {}

  ngOnInit(): void {
    window.addEventListener('editTransacao', (event: any) => {
      this.editingTransacao = event.detail;
    });
  }

  onFormSaved(): void {
    this.editingTransacao = null;
    window.location.reload();
  }

  onFormCancelled(): void {
    this.editingTransacao = null;
  }
}
