import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TipoAcessoPageRoutingModule } from './tipo-acesso-routing.module';
import { TipoAcessoPage } from './tipo-acesso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TipoAcessoPageRoutingModule
  ],
  declarations: [TipoAcessoPage]
})
export class TipoAcessoPageModule {}