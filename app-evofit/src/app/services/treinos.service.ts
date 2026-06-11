import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Treino {
  id?: number;
  aluno_id: number;
  titulo: string;
  objetivo?: string;
  exercicios?: string;
  observacoes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TreinosService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listar(aluno_id: number): Observable<Treino[]> {
    return this.http.get<Treino[]>(`${this.apiUrl}/treinos?aluno_id=${aluno_id}`);
  }

  cadastrar(treino: Treino): Observable<any> {
    return this.http.post(`${this.apiUrl}/treinos`, treino);
  }

  editar(treino: Treino): Observable<any> {
    return this.http.put(`${this.apiUrl}/treinos/${treino.id}`, treino);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/treinos/${id}`);
  }
}