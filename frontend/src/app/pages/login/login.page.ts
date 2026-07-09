import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type TipoAcesso = 'personal' | 'aluno';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  identificador = '';
  senha = '';
  erro = '';
  carregando = false;

  tipoAcesso: TipoAcesso = 'personal';

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(
      params => {
        const tipo = params.get('tipo');

        if (
          tipo === 'personal' ||
          tipo === 'aluno'
        ) {
          this.tipoAcesso = tipo;
        }
      }
    );
  }

  entrar(): void {
    this.erro = '';

    if (!this.identificador.trim() || !this.senha) {
      this.erro = 'Preencha CPF ou e-mail e senha.';
      return;
    }

    this.carregando = true;

    this.authService
      .login(this.identificador, this.senha)
      .subscribe({
        next: (dados) => {
          this.carregando = false;

          if (dados.usuario.tipo !== this.tipoAcesso) {
            this.erro =
              this.tipoAcesso === 'aluno'
                ? 'Esta conta não pertence a um aluno.'
                : 'Esta conta não pertence a um personal.';

            return;
          }

          this.authService.salvarSessao(dados);

          if (dados.usuario.tipo === 'aluno') {
            this.router.navigate(['/painel-aluno']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },

        error: (err) => {
          this.carregando = false;

          console.error('Erro no login:', err);

          this.erro =
            err.error?.erro ||
            'Não foi possível realizar o login.';
        }
      });
  }

  voltar(): void {
    this.router.navigate(['/tipo-acesso']);
  }
}