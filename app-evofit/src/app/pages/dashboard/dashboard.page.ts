import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  usuario: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.estaLogado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = this.authService.getUsuario();

    if (this.usuario?.tipo === 'aluno') {
      this.router.navigate(['/painel-aluno']);
    }
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }
}