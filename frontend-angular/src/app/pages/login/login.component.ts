import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  entrar(): void {
    if (!this.email || !this.senha) {
      this.erro = 'Preencha e-mail e senha.';
      return;
    }

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