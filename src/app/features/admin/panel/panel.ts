import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Catalogo } from '../../../core/services/catalogo';
import { Auth } from '../../../core/services/auth';
import { INegocio, IProducto, ISabor } from '../../../core/interfaces/catalogo';

type Pestana = 'productos' | 'sabores' | 'local';

@Component({
  selector: 'app-panel',
  imports: [FormsModule, RouterLink],
  templateUrl: './panel.html',
  styleUrl: '../admin.css',
})
export class PanelPage {
  protected catalogo = inject(Catalogo);
  private auth = inject(Auth);
  private router = inject(Router);

  protected pestana = signal<Pestana>('productos');
  protected aviso = signal<{ texto: string; ok: boolean } | null>(null);
  protected nuevoSabor = { nombre: '', grupo: '' };
  protected local: Partial<INegocio> = {};

  protected secciones = computed(() =>
    this.catalogo.categorias().map((c) => ({
      ...c,
      productos: this.catalogo.productos().filter((p) => p.categoria_id === c.id),
    })),
  );

  protected gruposSabores = computed(() => {
    const grupos = new Map<string, ISabor[]>();
    for (const s of this.catalogo.sabores()) {
      const g = s.grupo ?? 'Sabores';
      grupos.set(g, [...(grupos.get(g) ?? []), s]);
    }
    return [...grupos.entries()].map(([nombre, sabores]) => ({ nombre, sabores }));
  });

  constructor() {
    this.catalogo.cargar().then(() => (this.local = { ...this.catalogo.negocio()! }));
  }

  async guardarPrecio(p: IProducto, valor: string) {
    const precio = Number(valor);
    if (Number.isNaN(precio) || precio < 0 || precio === p.precio) return;
    this.mostrar(await this.catalogo.actualizarProducto(p.id, { precio }), `Precio de ${p.nombre} actualizado`);
  }

  async alternarProducto(p: IProducto) {
    const error = await this.catalogo.actualizarProducto(p.id, { disponible: !p.disponible });
    this.mostrar(error, `${p.nombre}: ${!p.disponible ? 'disponible' : 'sin stock'}`);
  }

  async alternarSabor(s: ISabor) {
    const error = await this.catalogo.actualizarSabor(s.id, { disponible: !s.disponible });
    this.mostrar(error, `${s.nombre}: ${!s.disponible ? 'disponible' : 'agotado'}`);
  }

  async agregarSabor() {
    const nombre = this.nuevoSabor.nombre.trim();
    if (!nombre) return;
    const error = await this.catalogo.agregarSabor(nombre, this.nuevoSabor.grupo.trim() || 'Sabores');
    this.mostrar(error, `Sabor ${nombre} agregado`);
    if (!error) this.nuevoSabor = { nombre: '', grupo: '' };
  }

  async alternarAbierto() {
    const abierto = !this.catalogo.negocio()?.abierto;
    this.mostrar(await this.catalogo.actualizarNegocio({ abierto }), abierto ? 'Local abierto' : 'Local cerrado');
  }

  async guardarLocal() {
    const { nombre, slogan, whatsapp, direccion, horario, color_principal } = this.local;
    const limpio = (whatsapp ?? '').replace(/\D/g, '');
    if (!nombre?.trim() || limpio.length < 10) {
      this.mostrar({ message: 'invalido' }, '', 'Revisá el nombre y el WhatsApp (con código de país, ej: 549...)');
      return;
    }
    const error = await this.catalogo.actualizarNegocio({ nombre, slogan, whatsapp: limpio, direccion, horario, color_principal });
    this.mostrar(error, 'Datos del local guardados');
  }

  async salir() {
    await this.auth.logout();
    this.router.navigateByUrl('/');
  }

  private mostrar(error: unknown, ok: string, mal = 'No se pudo guardar. Probá de nuevo.') {
    this.aviso.set(error ? { texto: mal, ok: false } : { texto: ok, ok: true });
    setTimeout(() => this.aviso.set(null), 2200);
  }
}
