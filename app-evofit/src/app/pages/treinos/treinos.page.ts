import { Component, OnInit } from '@angular/core';
import { TreinosService, Treino } from '../../services/treinos.service';

@Component({
  selector: 'app-treinos',
  templateUrl: './treinos.page.html',
  styleUrls: ['./treinos.page.scss'],
  standalone: false
})
export class TreinosPage implements OnInit {
  treinos: Treino[] = [];
  mostrarForm = false;
  atualTreino: Treino = { aluno_id: 1, titulo: '', objetivo: '', exercicios: '', observacoes: '' };

  constructor(private treinosService: TreinosService) {}

  ngOnInit() {
    this.carregarTreinos();
  }

  carregarTreinos() {
    this.treinosService.listar(this.atualTreino.aluno_id).subscribe({
      next: (res) => this.treinos = res,
      error: (err) => console.error('Erro ao listar treinos', err)
    });
  }

  abrirForm(treino?: Treino) {
    this.mostrarForm = true;
    if (treino) this.atualTreino = { ...treino }; // edição
    else this.atualTreino = { aluno_id: 1, titulo: '', objetivo: '', exercicios: '', observacoes: '' };
  }

  salvarTreino() {
    if (!this.atualTreino.id) {
      this.treinosService.cadastrar(this.atualTreino).subscribe({
        next: () => { this.carregarTreinos(); this.mostrarForm = false; },
        error: (err) => console.error('Erro ao cadastrar treino', err)
      });
    } else {
      this.treinosService.editar(this.atualTreino).subscribe({
        next: () => { this.carregarTreinos(); this.mostrarForm = false; },
        error: (err) => console.error('Erro ao editar treino', err)
      });
    }
  }

  excluirTreino(id?: number) {
    if (!id) return;
    this.treinosService.excluir(id).subscribe({
      next: () => this.carregarTreinos(),
      error: (err) => console.error('Erro ao excluir treino', err)
    });
  }

  cancelarForm() {
    this.mostrarForm = false;
  }
}