import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'painel-aluno',
    loadChildren: () => import('./pages/painel-aluno/painel-aluno.module').then(m => m.PainelAlunoPageModule)
  },
  {
    path: 'alunos',
    loadChildren: () => import('./pages/alunos/alunos.module').then(m => m.AlunosPageModule)
  },
  {
    path: 'treinos',
    loadChildren: () => import('./pages/treinos/treinos.module').then(m => m.TreinosPageModule)
  },
  {
    path: 'agenda',
    loadChildren: () => import('./pages/agenda/agenda.module').then(m => m.AgendaPageModule)
  },
  {
    path: 'acompanhamento',
    loadChildren: () => import('./pages/acompanhamento/acompanhamento.module').then(m => m.AcompanhamentoPageModule)
  },
  {
    path: 'acesso-aluno',
    loadChildren: () => import('./pages/acesso-aluno/acesso-aluno.module').then(m => m.AcessoAlunoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}