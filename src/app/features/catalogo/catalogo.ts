import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Catalogo } from '../../core/services/catalogo';
import { Carrito, IDatosPedido } from '../../core/services/carrito';
import { IProducto, ISabor } from '../../core/interfaces/catalogo';

const ICONOS = ['🍨', '🍦', '🍫', '✨', '🧁', '🥤'];

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class CatalogoPage {
  protected catalogo = inject(Catalogo);
  protected carrito = inject(Carrito);

  /** Categorías con sus productos, en orden. */
  protected secciones = computed(() =>
    this.catalogo.categorias().map((c, idx) => ({
      ...c,
      icono: ICONOS[idx % ICONOS.length],
      productos: this.catalogo.productos().filter((p) => p.categoria_id === c.id),
    })),
  );

  /** Sabores disponibles agrupados (Cremas, Chocolates, ...). */
  protected gruposSabores = computed(() => {
    const grupos = new Map<string, ISabor[]>();
    for (const s of this.catalogo.sabores().filter((s) => s.disponible)) {
      const g = s.grupo ?? 'Sabores';
      grupos.set(g, [...(grupos.get(g) ?? []), s]);
    }
    return [...grupos.entries()].map(([nombre, sabores]) => ({ nombre, sabores }));
  });

  // --- Selector de sabores ---
  protected productoEligiendo = signal<IProducto | null>(null);
  protected saboresElegidos = signal<string[]>([]);

  // --- Carrito ---
  protected carritoAbierto = signal(false);
  protected agregadoRecien = signal<string | null>(null);
  protected datos: IDatosPedido = { nombre: '', entrega: 'retiro', direccion: '', comentario: '' };

  constructor() {
    this.catalogo.cargar();
    // El color del local viene de Supabase: así cada cliente tiene su identidad sin tocar código.
    effect(() => {
      const color = this.catalogo.negocio()?.color_principal;
      if (color) document.documentElement.style.setProperty('--marca', color);
      const nombre = this.catalogo.negocio()?.nombre;
      if (nombre) document.title = `${nombre} · Pedí online`;
    });
  }

  iconoDe(categoriaId: number) {
    return this.secciones().find((s) => s.id === categoriaId)?.icono ?? '🍨';
  }

  irA(id: number) {
    document.getElementById('cat-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  tocarProducto(p: IProducto) {
    if (!p.disponible) return;
    if (p.max_sabores > 0) {
      this.saboresElegidos.set([]);
      this.productoEligiendo.set(p);
    } else {
      this.agregar(p, []);
    }
  }

  alternarSabor(nombre: string) {
    const max = this.productoEligiendo()?.max_sabores ?? 0;
    this.saboresElegidos.update((sel) => {
      if (sel.includes(nombre)) return sel.filter((s) => s !== nombre);
      return sel.length < max ? [...sel, nombre] : sel;
    });
  }

  confirmarSabores() {
    const p = this.productoEligiendo();
    if (!p || this.saboresElegidos().length === 0) return;
    this.agregar(p, this.saboresElegidos());
    this.productoEligiendo.set(null);
  }

  private agregar(p: IProducto, sabores: string[]) {
    this.carrito.agregar(p, sabores);
    this.agregadoRecien.set(p.nombre);
    setTimeout(() => this.agregadoRecien.set(null), 1800);
  }

  pedidoValido() {
    const d = this.datos;
    return (
      this.carrito.cantidadTotal() > 0 &&
      d.nombre.trim().length > 1 &&
      (d.entrega === 'retiro' || d.direccion.trim().length > 3)
    );
  }

  enviarPedido() {
    const negocio = this.catalogo.negocio();
    if (!negocio || !negocio.abierto || !this.pedidoValido()) return;
    const url = this.carrito.linkWhatsapp(negocio, this.datos);
    // Si el navegador bloquea la pestaña nueva (pasa en algunos celulares o con Brave), abrimos WhatsApp en la misma pestaña.
    const ventana = window.open(url, '_blank');
    if (ventana) ventana.opener = null;
    else window.location.href = url;
  }
}
