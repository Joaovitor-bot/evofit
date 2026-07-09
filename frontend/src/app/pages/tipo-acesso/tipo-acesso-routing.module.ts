import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TipoAcessoPage } from './tipo-acesso.page';

const routes: Routes = [
  {
    path: '',
    component: TipoAcessoPage
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipoAcessoPageRoutingModule {}


