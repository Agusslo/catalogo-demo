import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  styleUrl: '../admin.css',
  template: `
    <div class="admin">
      <form class="tarjeta login" (ngSubmit)="entrar()">
        <h1>Panel del local</h1>
        <p>Entrá para cambiar precios, sabores y horarios.</p>
        <label>Email
          <input type="email" [(ngModel)]="email" name="email" autocomplete="username" required />
        </label>
        <label>Contraseña
          <input type="password" [(ngModel)]="password" name="password" autocomplete="current-password" required />
        </label>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button class="btn" type="submit" [disabled]="cargando() || !email || !password">
          {{ cargando() ? 'Entrando…' : 'Entrar' }}
        </button>
        <a routerLink="/">← Volver al menú</a>
      </form>
    </div>
  `,
})
export class LoginPage {
  private auth = inject(Auth);
  private router = inject(Router);
  protected email = '';
  protected password = '';
  protected cargando = signal(false);
  protected error = signal<string | null>(null);

  async entrar() {
    this.cargando.set(true);
    this.error.set(await this.auth.login(this.email.trim(), this.password));
    this.cargando.set(false);
    if (!this.error()) this.router.navigateByUrl('/admin');
  }
}
