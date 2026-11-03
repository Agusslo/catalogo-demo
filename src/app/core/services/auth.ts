import { Injectable, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { Supabase } from './supabase';

@Injectable({ providedIn: 'root' })
export class Auth {
  private db = inject(Supabase).client;
  readonly sesion = signal<Session | null>(null);
  private listo: Promise<void>;

  constructor() {
    this.listo = this.db.auth.getSession().then(({ data }) => this.sesion.set(data.session));
    this.db.auth.onAuthStateChange((_evento, sesion) => this.sesion.set(sesion));
  }

  async esAdmin(): Promise<boolean> {
    await this.listo;
    const uid = this.sesion()?.user.id;
    if (!uid) return false;
    const { data } = await this.db.from('admins').select('user_id').eq('user_id', uid).maybeSingle();
    return !!data;
  }

  async login(email: string, password: string): Promise<string | null> {
    const { error } = await this.db.auth.signInWithPassword({ email, password });
    if (error) return 'Email o contraseña incorrectos.';
    if (!(await this.esAdmin())) {
      await this.logout();
      return 'Esta cuenta no tiene permiso para administrar el local.';
    }
    return null;
  }

  logout() {
    return this.db.auth.signOut();
  }
}
