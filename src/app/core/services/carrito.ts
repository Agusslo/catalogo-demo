import { Injectable, computed, effect, signal } from '@angular/core';
import { IItemCarrito, INegocio, IProducto } from '../interfaces/catalogo';

const CLAVE_STORAGE = 'catalogo-demo-carrito';

export interface IDatosPedido {
  nombre: string;
  entrega: 'retiro' | 'envio';
  direccion: string;
  comentario: string;
}

@Injectable({ providedIn: 'root' })
export class Carrito {
  readonly items = signal<IItemCarrito[]>(this.leerGuardado());

  readonly cantidadTotal = computed(() => this.items().reduce((acc, i) => acc + i.cantidad, 0));
  readonly total = computed(() => this.items().reduce((acc, i) => acc + i.cantidad * i.producto.precio, 0));

  constructor() {
    // Guardamos el carrito para que no se pierda si el cliente recarga la página.
    effect(() => {
      try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(this.items()));
      } catch {
        /* sin storage: el carrito vive solo en memoria */
      }
    });
  }

  agregar(producto: IProducto, sabores: string[] = []) {
    const clave = `${producto.id}|${[...sabores].sort().join(',')}`;
    this.items.update((items) => {
      const existente = items.find((i) => i.clave === clave);
      if (existente) return items.map((i) => (i.clave === clave ? { ...i, cantidad: i.cantidad + 1 } : i));
      return [...items, { clave, producto, sabores, cantidad: 1 }];
    });
  }

  cambiarCantidad(clave: string, delta: number) {
    this.items.update((items) =>
      items.map((i) => (i.clave === clave ? { ...i, cantidad: i.cantidad + delta } : i)).filter((i) => i.cantidad > 0),
    );
  }

  vaciar() {
    this.items.set([]);
  }

  /** Arma el link de WhatsApp con el pedido ya escrito. */
  linkWhatsapp(negocio: INegocio, datos: IDatosPedido): string {
    const pesos = (n: number) => '$' + n.toLocaleString('es-AR');
    const lineas = this.items().map((i) => {
      const sabores = i.sabores.length ? ` (${i.sabores.join(', ')})` : '';
      return `• ${i.cantidad} x ${i.producto.nombre}${sabores} — ${pesos(i.cantidad * i.producto.precio)}`;
    });
    const texto = [
      `¡Hola ${negocio.nombre}! Quiero hacer un pedido:`,
      '',
      ...lineas,
      '',
      `*Total: ${pesos(this.total())}*`,
      '',
      `Nombre: ${datos.nombre}`,
      datos.entrega === 'envio' ? `Envío a: ${datos.direccion}` : 'Retiro en el local',
      datos.comentario ? `Comentario: ${datos.comentario}` : '',
    ]
      .filter((l, idx, arr) => !(l === '' && arr[idx - 1] === ''))
      .join('\n')
      .trim();
    return `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(texto)}`;
  }

  private leerGuardado(): IItemCarrito[] {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_STORAGE) ?? '[]');
    } catch {
      return [];
    }
  }
}
