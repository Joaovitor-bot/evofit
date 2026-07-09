import { Component, OnInit } from '@angular/core';
import { TreinosService, Treino } from '../../services/treinos.service';
import { AlunosService, Aluno } from '../../services/alunos.service';

@Component({
  selector: 'app-treinos',
  templateUrl: './treinos.page.html',
  styleUrls: ['./treinos.page.scss'],
  standalone: false
})
export class TreinosPage implements OnInit {
  alunos: Aluno[] = [];
  treinos: Treino[] = [];

  mostrarForm = false;
  erro = '';
  sucesso = '';

  alunoFiltro: number | null = null;

  atualTreino: Treino = {
    aluno_id: null,
    titulo: '',
    objetivo: '',
    exercicios: '',
    observacoes: ''
  };

  constructor(
    private treinosService: TreinosService,
    private alunosService: AlunosService
  ) {}

  ngOnInit() {
    this.carregarAlunos();
    this.carregarTreinos();
  }

  carregarAlunos() {
    this.alunosService.listar().subscribe({
      next: (res) => {
        this.alunos = res;
        console.log('Alunos carregados:', res);
      },
      error: (err) => {
        console.error('Erro ao carregar alunos:', err);
        this.erro = 'Erro ao carregar alunos.';
      }
    });
  }

  carregarTreinos() {
    this.treinosService.listar(this.alunoFiltro).subscribe({
      next: (res) => {
        this.treinos = res;
        console.log('Treinos carregados:', res);
      },
      error: (err) => {
        console.error('Erro ao carregar treinos:', err);
        this.erro = 'Erro ao carregar treinos.';
      }
    });
  }

  filtrarPorAluno() {
    this.carregarTreinos();
  }

  abrirForm(treino?: Treino) {
    this.erro = '';
    this.sucesso = '';
    this.mostrarForm = true;

    if (treino) {
      this.atualTreino = { ...treino };
    } else {
      this.atualTreino = {
        aluno_id: null,
        titulo: '',
        objetivo: '',
        exercicios: '',
        observacoes: ''
      };
    }
  }

  salvarTreino() {
    this.erro = '';
    this.sucesso = '';

    if (!this.atualTreino.aluno_id) {
      this.erro = 'Selecione um aluno.';
      return;
    }

    if (!this.atualTreino.titulo) {
      this.erro = 'Informe o título do treino.';
      return;
    }

    if (!this.atualTreino.id) {
      this.treinosService.cadastrar(this.atualTreino).subscribe({
        next: () => {
          this.sucesso = 'Treino cadastrado com sucesso!';
          this.mostrarForm = false;
          this.carregarTreinos();
        },
        error: (err) => {
          console.error('Erro ao cadastrar treino:', err);
          this.erro = err.error?.erro || 'Erro ao cadastrar treino.';
        }
      });
    } else {
      this.treinosService.editar(this.atualTreino).subscribe({
        next: () => {
          this.sucesso = 'Treino atualizado com sucesso!';
          this.mostrarForm = false;
          this.carregarTreinos();
        },
        error: (err) => {
          console.error('Erro ao editar treino:', err);
          this.erro = err.error?.erro || 'Erro ao editar treino.';
        }
      });
    }
  }

  excluirTreino(id?: number) {
    if (!id) return;

    this.treinosService.excluir(id).subscribe({
      next: () => {
        this.sucesso = 'Treino excluído com sucesso!';
        this.carregarTreinos();
      },
      error: (err) => {
        console.error('Erro ao excluir treino:', err);
        this.erro = err.error?.erro || 'Erro ao excluir treino.';
      }
    });
  }

  cancelarForm() {
    this.mostrarForm = false;
    this.erro = '';
    this.sucesso = '';
  }
}