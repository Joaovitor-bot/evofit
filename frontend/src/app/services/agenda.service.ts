import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type StatusAula =
  | 'Pendente'
  | 'Confirmada'
  | 'Recusada pelo aluno'
  | 'Cancelada pelo personal'
  | 'Concluída'
  | 'Falta do aluno';

export interface Aula {
  id?: number;
  aluno_id: number | null;
  aluno_nome?: string | null;
  data: string;
  horario: string;
  local?: string;
  latitude?: string;
  longitude?: string;
  status: StatusAula;
}

export interface RespostaAgenda {
  mensagem: string;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listar(): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiUrl}/agenda`);
  }

  cadastrar(aula: Aula): Observable<RespostaAgenda> {
    return this.http.post<RespostaAgenda>(
      `${this.apiUrl}/agenda`,
      aula
    );
  }

  atualizarStatus(
    id: number,
    status: StatusAula
  ): Observable<RespostaAgenda> {
    return this.http.patch<RespostaAgenda>(
      `${this.apiUrl}/agenda/${id}/status`,
      { status }
    );
  }

  excluir(id: number): Observable<RespostaAgenda> {
    return this.http.delete<RespostaAgenda>(
      `${this.apiUrl}/agenda/${id}`
    );
  }
}