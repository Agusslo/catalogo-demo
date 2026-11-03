import { Injectable, inject, signal } from '@angular/core';
import { Supabase } from './supabase';
import { ICategoria, INegocio, IProducto, ISabor } from '../interfaces/catalogo';

@Injectable({ providedIn: 'root' })
export class Catalogo {
  private db = inject(Supabase).client;

  readonly negocio = signal<INegocio | null>(null);
  readonly categorias = signal<ICategoria[]>([]);
  readonly productos = signal<IProducto[]>([]);
  readonly sabores = signal<ISabor[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    const [neg, cat, prod, sab] = await Promise.all([
      this.db.from('negocio').select('*').single(),
      this.db.from('categorias').select('*').order('orden'),
      this.db.from('productos').select('*').order('orden'),
      this.db.from('sabores').select('*').order('grupo').order('orden'),
    ]);
    const fallo = neg.error ?? cat.error ?? prod.error ?? sab.error;
    if (fallo) {
      this.error.set('No pudimos cargar el catálogo. Probá de nuevo en un rato.');
    } else {
      this.negocio.set(neg.data as INegocio);
      this.categorias.set(cat.data as ICategoria[]);
      this.productos.set((prod.data as IProducto[]).map((p) => ({ ...p, precio: Number(p.precio) })));
      this.sabores.set(sab.data as ISabor[]);
    }
    this.cargando.set(false);
  }

  // --- Acciones del panel (las protege RLS: solo admins pueden escribir) ---

  async actualizarProducto(id: number, cambios: Partial<IProducto>) {
    const { error } = await this.db.from('productos').update(cambios).eq('id', id);
    if (!error) this.productos.update((ps) => ps.map((p) => (p.id === id ? { ...p, ...cambios } : p)));
    return error;
  }

  async actualizarSabor(id: number, cambios: Partial<ISabor>) {
    const { error } = await this.db.from('sabores').update(cambios).eq('id', id);
    if (!error) this.sabores.update((ss) => ss.map((s) => (s.id === id ? { ...s, ...cambios } : s)));
    return error;
  }

  async agregarSabor(nombre: string, grupo: string) {
    const { data, error } = await this.db.from('sabores').insert({ nombre, grupo }).select().single();
    if (!error && data) this.sabores.update((ss) => [...ss, data as ISabor]);
    return error;
  }

  async actualizarNegocio(cambios: Partial<INegocio>) {
    const { error } = await this.db.from('negocio').update(cambios).eq('id', 1);
    if (!error) this.negocio.update((n) => (n ? { ...n, ...cambios } : n));
    return error;
  }
}
