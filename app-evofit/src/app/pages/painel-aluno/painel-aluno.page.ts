import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AgendaService, Aula } from '../../services/agenda.service';
import { Aluno } from '../../services/alunos.service';
import { AuthService } from '../../services/auth.service';
import {
  PainelAlunoService
} from '../../services/painel-aluno.service';
import { Treino } from '../../services/treinos.service';

@Component({
  selector: 'app-painel-aluno',
  templateUrl: './painel-aluno.page.html',
  styleUrls: ['./painel-aluno.page.scss'],
  standalone: false
})
export class PainelAlunoPage {
  aluno: Aluno | null = null;
  aulas: Aula[] = [];
  treinos: Treino[] = [];

  carregando = false;
  erro = '';
  mensagem = '';
  processandoAulaId: number | null = null;
  primeiroAcesso = false;

  constructor(
    private authService: AuthService,
    private painelAlunoService: PainelAlunoService,
    private agendaService: AgendaService,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    this.carregarPainel();
  }

  carregarPainel(): void {
    this.erro = '';

    const usuario = this.authService.getUsuario();

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    if (usuario.tipo !== 'aluno') {
      this.router.navigate(['/dashboard']);
      return;
    }

    const alunoId = Number(usuario.aluno_id);

    if (!alunoId) {
      this.erro =
        'Esta conta ainda não está vinculada a um aluno.';
      return;
    }

    this.primeiroAcesso =
      Boolean(usuario.primeiro_acesso);

    this.carregando = true;

    this.painelAlunoService
      .buscarPainel(alunoId)
      .subscribe({
        next: (dados) => {
          this.aluno = dados.aluno;
          this.aulas = dados.agenda || [];
          this.treinos = dados.treinos || [];

          this.carregando = false;
        },

        error: (err: HttpErrorResponse) => {
          console.error(
            'Erro ao carregar painel:',
            err
          );

          this.erro =
            (err.error as any)?.erro ||
            'Não foi possível carregar o painel.';

          this.carregando = false;
        }
      });
  }

confirmarAula(aula: Aula): void {
  this.atualizarStatusAula(
    aula,
    'Confirmada',
    'Aula confirmada com sucesso!'
  );
}

recusarAula(aula: Aula): void {
  const confirmar = window.confirm(
    'Deseja realmente recusar esta aula?'
  );

  if (!confirmar) {
    return;
  }

  this.atualizarStatusAula(
    aula,
    'Recusada pelo aluno',
    'Aula recusada.'
  );
}

private atualizarStatusAula(
  aula: Aula,
  status: 'Confirmada' | 'Recusada pelo aluno',
  mensagemSucesso: string
): void {
  if (!aula.id || aula.status !== 'Pendente') {
    return;
  }

  this.erro = '';
  this.mensagem = '';
  this.processandoAulaId = aula.id;

  this.agendaService
    .atualizarStatus(aula.id, status)
    .subscribe({
      next: () => {
        this.mensagem = mensagemSucesso;
        this.processandoAulaId = null;
        this.carregarPainel();
      },

      error: (err: HttpErrorResponse) => {
        console.error(
          'Erro ao responder agendamento:',
          err
        );

        this.erro =
          (err.error as any)?.erro ||
          'Não foi possível responder ao agendamento.';

        this.processandoAulaId = null;
      }
    });
}

  corDoStatus(status: string): string {
    switch (status) {
      case 'Pendente':
        return 'warning';

      case 'Confirmada':
        return 'success';

      case 'Concluída':
        return 'primary';

      case 'Recusada pelo aluno':
      case 'Cancelada pelo personal':
        return 'danger';

      case 'Falta do aluno':
        return 'medium';

      default:
        return 'medium';
    }
  }

  formatarData(data: string): string {
    if (!data) {
      return 'Data não informada';
    }

    const partes = data.split('-');

    if (partes.length !== 3) {
      return data;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  sair(): void {
    this.authService.sair();
    this.router.navigate(['/tipo-acesso']);
  }
}