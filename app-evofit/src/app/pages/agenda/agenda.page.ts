import { Component } from '@angular/core';
import { Aluno, AlunosService } from '../../services/alunos.service';
import {
  AgendaService,
  Aula,
  StatusAula
} from '../../services/agenda.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: false
})
export class AgendaPage {
  alunos: Aluno[] = [];
  aulas: Aula[] = [];

  carregando = false;
  mostrarFormulario = false;
  mensagem = '';
  erro = '';

  statusDisponiveis: StatusAula[] = [
    'Confirmada',
    'Concluída',
    'Falta do aluno',
    'Cancelada'
  ];

  novaAula: Aula = this.criarAulaVazia();

  constructor(
    private agendaService: AgendaService,
    private alunosService: AlunosService
  ) {}

  ionViewWillEnter(): void {
    this.carregarAlunos();
    this.carregarAgenda();
  }

  criarAulaVazia(): Aula {
    return {
      aluno_id: null,
      data: '',
      horario: '',
      local: '',
      latitude: '',
      longitude: '',
      status: 'Confirmada'
    };
  }

  carregarAlunos(): void {
    this.alunosService.listar().subscribe({
      next: (alunos) => {
        this.alunos = alunos;
      },
      error: (err) => {
        console.error('Erro ao carregar alunos:', err);
        this.erro = 'Não foi possível carregar os alunos.';
      }
    });
  }

  carregarAgenda(): void {
    this.carregando = true;

    this.agendaService.listar().subscribe({
      next: (aulas) => {
        this.aulas = aulas;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar agenda:', err);
        this.erro = 'Não foi possível carregar a agenda.';
        this.carregando = false;
      }
    });
  }

  abrirFormulario(): void {
    this.limparMensagens();
    this.novaAula = this.criarAulaVazia();
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.novaAula = this.criarAulaVazia();
    this.limparMensagens();
  }

  salvarAula(): void {
    this.limparMensagens();

    if (!this.novaAula.aluno_id) {
      this.erro = 'Selecione um aluno.';
      return;
    }

    if (!this.novaAula.data) {
      this.erro = 'Informe a data da aula.';
      return;
    }

    if (!this.novaAula.horario) {
      this.erro = 'Informe o horário da aula.';
      return;
    }

    this.agendaService.cadastrar(this.novaAula).subscribe({
      next: () => {
        this.mensagem = 'Aula cadastrada com sucesso!';
        this.mostrarFormulario = false;
        this.novaAula = this.criarAulaVazia();
        this.carregarAgenda();
      },
      error: (err) => {
        console.error('Erro ao cadastrar aula:', err);
        this.erro =
          err.error?.erro ||
          'Não foi possível cadastrar a aula.';
      }
    });
  }

  alterarStatus(
    id: number | undefined,
    status: StatusAula
  ): void {
    if (!id) {
      return;
    }

    this.limparMensagens();

    this.agendaService.atualizarStatus(id, status).subscribe({
      next: () => {
        this.mensagem = 'Status atualizado com sucesso!';
        this.carregarAgenda();
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);
        this.erro =
          err.error?.erro ||
          'Não foi possível atualizar o status.';
      }
    });
  }

  excluirAula(id: number | undefined): void {
    if (!id) {
      return;
    }

    const confirmar = window.confirm(
      'Deseja realmente excluir esta aula?'
    );

    if (!confirmar) {
      return;
    }

    this.limparMensagens();

    this.agendaService.excluir(id).subscribe({
      next: () => {
        this.mensagem = 'Aula excluída com sucesso!';
        this.carregarAgenda();
      },
      error: (err) => {
        console.error('Erro ao excluir aula:', err);
        this.erro =
          err.error?.erro ||
          'Não foi possível excluir a aula.';
      }
    });
  }

  criarLinkMapa(local?: string): string {
    if (!local) {
      return '';
    }

    return (
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(local)
    );
  }

  limparMensagens(): void {
    this.mensagem = '';
    this.erro = '';
  }
}