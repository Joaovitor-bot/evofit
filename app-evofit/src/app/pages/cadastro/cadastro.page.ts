import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false
})
export class CadastroPage {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  erro = '';
  sucesso = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  cadastrar() {
    this.erro = '';
    this.sucesso = '';

    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    this.authService.cadastrar(this.nome, this.email, this.senha).subscribe({
      next: () => {
        this.sucesso = 'Conta criada com sucesso! Faça login para continuar.';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (err) => {
        this.erro = err.error?.erro || 'Erro ao criar conta.';
      }
    });
  }

  voltarLogin() {
    this.router.navigate(['/login']);
  }
}