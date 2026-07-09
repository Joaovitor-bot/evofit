import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AcessoAlunoPageRoutingModule } from './acesso-aluno-routing.module';

import { AcessoAlunoPage } from './acesso-aluno.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AcessoAlunoPageRoutingModule
  ],
  declarations: [AcessoAlunoPage]
})
export class AcessoAlunoPageModule {}
