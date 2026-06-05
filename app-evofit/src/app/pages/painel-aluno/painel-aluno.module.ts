import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PainelAlunoPageRoutingModule } from './painel-aluno-routing.module';

import { PainelAlunoPage } from './painel-aluno.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PainelAlunoPageRoutingModule
  ],
  declarations: [PainelAlunoPage]
})
export class PainelAlunoPageModule {}
