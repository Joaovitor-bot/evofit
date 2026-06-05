import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PainelAlunoComponent } from './pages/painel-aluno/painel-aluno.component';
import { AlunosComponent } from './pages/alunos/alunos.component';
import { TreinosComponent } from './pages/treinos/treinos.component';
import { AgendaComponent } from './pages/agenda/agenda.component';
import { AcompanhamentoComponent } from './pages/acompanhamento/acompanhamento.component';
import { AcessoAlunoComponent } from './pages/acesso-aluno/acesso-aluno.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'painel-aluno', component: PainelAlunoComponent },
  { path: 'alunos', component: AlunosComponent },
  { path: 'treinos', component: TreinosComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: 'acompanhamento', component: AcompanhamentoComponent },
  { path: 'acesso-aluno', component: AcessoAlunoComponent },
  { path: '**', redirectTo: '' }
];