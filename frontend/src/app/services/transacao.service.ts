import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transacao, Saldo } from '../models/transacao.model';

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {
  private apiUrl = 'http://localhost:3000/api/transacoes';

  constructor(private http: HttpClient) {}

  getTransacoes(categoria?: string, tipo?: string): Observable<Transacao[]> {
    let params = new HttpParams();
    if (categoria) {
      params = params.set('categoria', categoria);
    }
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    return this.http.get<Transacao[]>(this.apiUrl, { params });
  }

  getTransacao(id: string): Observable<Transacao> {
    return this.http.get<Transacao>(`${this.apiUrl}/${id}`);
  }

  createTransacao(transacao: Transacao): Observable<Transacao> {
    return this.http.post<Transacao>(this.apiUrl, transacao);
  }

  updateTransacao(id: string, transacao: Transacao): Observable<Transacao> {
    return this.http.put<Transacao>(`${this.apiUrl}/${id}`, transacao);
  }

  deleteTransacao(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSaldo(): Observable<Saldo> {
    return this.http.get<Saldo>(`${this.apiUrl}/saldo/total`);
  }
}

