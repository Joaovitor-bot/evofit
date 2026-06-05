import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PainelAlunoPage } from './painel-aluno.page';

const routes: Routes = [
  {
    path: '',
    component: PainelAlunoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PainelAlunoPageRoutingModule {}
