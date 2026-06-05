import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email = '';
  senha = '';
  erro = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  entrar() {
    if (!this.email || !this.senha) {
      this.erro = 'Preencha e-mail e senha.';
      return;
    }

    this.erro = '';

    this.authService.login(this.email, this.senha).subscribe({
      next: (dados) => {
        this.authService.salvarSessao(dados);

        if (dados.usuario.tipo === 'aluno') {
          this.router.navigate(['/painel-aluno']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.erro = err.error?.erro || 'Erro ao fazer login.';
      }
    });
  }
}