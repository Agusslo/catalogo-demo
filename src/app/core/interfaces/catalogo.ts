export interface INegocio {
  id: number;
  nombre: string;
  slogan: string | null;
  whatsapp: string;
  direccion: string | null;
  horario: string | null;
  color_principal: string;
  logo_url: string | null;
  abierto: boolean;
}

export interface ICategoria {
  id: number;
  nombre: string;
  orden: number;
}

export interface IProducto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  max_sabores: number;
  disponible: boolean;
  orden: number;
}

export interface ISabor {
  id: number;
  nombre: string;
  grupo: string | null;
  disponible: boolean;
  orden: number;
}

export interface IItemCarrito {
  clave: string; // producto + sabores, para agrupar iguales
  producto: IProducto;
  sabores: string[];
  cantidad: number;
}
