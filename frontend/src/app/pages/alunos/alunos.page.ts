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
  mostrarForm = false;
  generos = ['Masculino', 'Feminino', 'Outro'];

   statusAlunos = ['Ativo', 'Inativo'];

  // aluno atual para cadastro/edição
  atualAluno: Aluno = this.criarAlunoVazio();

  constructor(private alunosService: AlunosService) {}

    criarAlunoVazio(): Aluno {
    return {
      nome: '',
      cpf: '',
      data_nascimento: '',
      whatsapp: '',
      email: '',
      genero: 'Masculino',
      contato_emergencia: '',
      status: 'Ativo'
    };
  }

  ngOnInit() {
    this.carregarAlunos();
  }

  carregarAlunos() {
    this.alunosService.listar().subscribe({
      next: (res) => {
        console.log('Alunos recebidos:', res);
        this.alunos = res;
      },
      error: (err) => console.error('Erro ao listar alunos', err)
    });
  }

  abrirForm(aluno?: Aluno) {
    this.mostrarForm = true;
    if (aluno) {
      // Edição: preenche o formulário com os dados do aluno
      this.atualAluno = { ...aluno };
    } else {
      // Novo aluno
      this.atualAluno = this.criarAlunoVazio();
    }
  }

  salvarAluno() {
    if (!this.atualAluno.id) {
      // Cadastro
      this.alunosService.cadastrar(this.atualAluno).subscribe({
        next: () => {
          this.carregarAlunos();
          this.mostrarForm = false;
        },
        error: (err) => console.error('Erro ao cadastrar aluno', err)
      });
    } else {
      // Edição
      this.alunosService.editar(this.atualAluno).subscribe({
        next: () => {
          this.carregarAlunos();
          this.mostrarForm = false;
        },
        error: (err) => console.error('Erro ao editar aluno', err)
      });
    }
  }

  excluirAluno(id?: number) {
    if (!id) return;
    this.alunosService.excluir(id).subscribe({
      next: () => this.carregarAlunos(),
      error: (err) => console.error('Erro ao excluir aluno', err)
    });
  }

  cancelarForm() {
    this.mostrarForm = false;
  }
}