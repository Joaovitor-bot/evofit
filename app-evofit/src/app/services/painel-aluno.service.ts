import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Aluno } from './alunos.service';
import { Aula } from './agenda.service';
import { Treino } from './treinos.service';

export interface PainelAlunoResposta {
  aluno: Aluno;
  treinos: Treino[];
  agenda: Aula[];
}

@Injectable({
  providedIn: 'root'
})
export class PainelAlunoService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  buscarPainel(
    alunoId: number
  ): Observable<PainelAlunoResposta> {
    return this.http.get<PainelAlunoResposta>(
      `${this.apiUrl}/painel-aluno/${alunoId}`
    );
  }
}