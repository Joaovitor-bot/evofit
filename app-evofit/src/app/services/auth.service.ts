import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    tipo: 'personal' | 'aluno';
    aluno_id?: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      senha
    });
  }

  cadastrar(nome: string, email: string, senha: string) {
  return this.http.post(`${this.apiUrl}/usuarios`, {
    nome,
    email,
    senha,
    tipo: 'personal'
  });
 }

  salvarSessao(dados: LoginResponse): void {
    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
  }

  getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  estaLogado(): boolean {
    return !!localStorage.getItem('token');
  }

  sair(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
}