import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';

import {
  Aluno,
  AlunosService
} from '../../services/alunos.service';

@Component({
  selector: 'app-acesso-aluno',
  templateUrl: './acesso-aluno.page.html',
  styleUrls: ['./acesso-aluno.page.scss'],
  standalone: false
})
export class AcessoAlunoPage {
  alunos: Aluno[] = [];

  alunoId: number | null = null;
  cpf = '';
  email = '';
  senha = '';
  confirmarSenha = '';

  carregandoAlunos = false;
  salvando = false;

  erro = '';
  sucesso = '';

  constructor(
    private alunosService: AlunosService
  ) {}

  ionViewWillEnter(): void {
    this.carregarAlunos();
  }

  carregarAlunos(): void {
    this.carregandoAlunos = true;
    this.erro = '';

    this.alunosService.listar().subscribe({
      next: (alunos) => {
        this.alunos = alunos;
        this.carregandoAlunos = false;
      },

      error: (err: HttpErrorResponse) => {
        console.error(
          'Erro ao carregar alunos:',
          err
        );

        this.erro =
          'Não foi possível carregar os alunos.';

        this.carregandoAlunos = false;
      }
    });
  }

  criarAcesso(): void {
    this.erro = '';
    this.sucesso = '';

    const cpfNumeros = this.cpf.replace(/\D/g, '');

    if (!this.alunoId) {
      this.erro = 'Selecione um aluno.';
      return;
    }

    if (cpfNumeros.length !== 11) {
      this.erro =
        'Informe um CPF com 11 números.';
      return;
    }

    if (!this.email.trim()) {
      this.erro = 'Informe o e-mail do aluno.';
      return;
    }

    if (this.senha.length < 6) {
      this.erro =
        'A senha deve possuir pelo menos 6 caracteres.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    this.salvando = true;

    this.alunosService
      .criarAcesso(
        this.alunoId,
        cpfNumeros,
        this.email.trim(),
        this.senha
      )
      .subscribe({
        next: () => {
          this.salvando = false;

          this.sucesso =
            'Acesso criado com sucesso! O aluno já pode entrar no aplicativo.';

          this.limparFormulario();
        },

        error: (err: HttpErrorResponse) => {
          console.error(
            'Erro ao criar acesso:',
            err
          );

          this.erro =
            (err.error as any)?.erro ||
            'Não foi possível criar o acesso.';

          this.salvando = false;
        }
      });
  }

  limparFormulario(): void {
    this.alunoId = null;
    this.cpf = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';
  }
}