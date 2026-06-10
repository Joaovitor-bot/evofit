import { Component, OnInit } from '@angular/core';
import { AlunosService, Aluno } from '../../services/alunos.service';

@Component({
  selector: 'app-alunos',
  templateUrl: './alunos.page.html',
  styleUrls: ['./alunos.page.scss'],
  standalone: false
})
export class AlunosPage implements OnInit {
  alunos: Aluno[] = [];
  novoAluno: Aluno = { nome: '', whatsapp: '', email: '', genero: 'Masculino' };
  mostrarForm = false;

  generos = ['Masculino', 'Feminino', 'Outro'];

  constructor(private alunosService: AlunosService) {}

  ngOnInit() {
    this.carregarAlunos();
  }

  carregarAlunos() {
    this.alunosService.listar().subscribe({
      next: (res) => this.alunos = res,
      error: (err) => console.error('Erro ao listar alunos', err)
    });
  }

  abrirForm() {
    this.mostrarForm = true;
    this.novoAluno = { nome: '', whatsapp: '', email: '', genero: 'Masculino' };
  }

  cadastrarAluno() {
    this.alunosService.cadastrar(this.novoAluno).subscribe({
      next: () => {
        this.carregarAlunos();
        this.mostrarForm = false;
      },
      error: (err) => console.error('Erro ao cadastrar aluno', err)
    });
  }

  excluirAluno(id?: number) {
    if (!id) return;

    this.alunosService.excluir(id).subscribe({
      next: () => this.carregarAlunos(),
      error: (err) => console.error('Erro ao excluir aluno', err)
    });
  }
}