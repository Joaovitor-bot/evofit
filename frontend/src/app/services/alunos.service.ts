import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Aluno {
  id?: number;
  nome: string;
  cpf?: string | null;
  data_nascimento?: string | null;
  whatsapp: string;
  email: string;
  genero: string;
  contato_emergencia?: string | null;
  status?: string;
}

export interface AcessoAlunoResposta {
  mensagem: string;
  usuario_id: number;
  aluno_id: number;
  primeiro_acesso: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlunosService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listar(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(
      `${this.apiUrl}/alunos`
    );
  }

  cadastrar(aluno: Aluno): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/alunos`,
      aluno
    );
  }

  editar(aluno: Aluno): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/alunos/${aluno.id}`,
      aluno
    );
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/alunos/${id}`
    );
  }

  criarAcesso(
    alunoId: number,
    cpf: string,
    email: string,
    senha: string
  ): Observable<AcessoAlunoResposta> {
    return this.http.post<AcessoAlunoResposta>(
      `${this.apiUrl}/alunos/${alunoId}/acesso`,
      {
        cpf,
        email,
        senha
      }
    );
  }
}