# Catálogo online con pedidos por WhatsApp

Demo de un menú online para comercios (en este caso, una heladería): el cliente arma su pedido, elige sabores y lo manda listo por WhatsApp. El dueño cambia precios, stock, sabores y horarios desde un panel, sin tocar código.

**Demo:** https://catalogo-demo.vercel.app

## Funcionalidades

- Menú por categorías con navegación rápida
- Selector de sabores con límite por producto (ej: 1/4 kg hasta 3 sabores)
- Carrito que se guarda aunque el cliente recargue la página
- Pedido armado automáticamente en WhatsApp, con retiro o envío
- Panel del dueño (`/admin`): precios, productos sin stock, sabores, abrir/cerrar el local y datos del negocio
- El color y los datos del local salen de la base de datos: se adapta a otro comercio sin cambiar código

## Stack

Angular (standalone components, signals, control flow) · Supabase (PostgreSQL + Auth + Row Level Security) · Vercel

## Seguridad

Cualquiera puede leer el catálogo, pero solo los usuarios cargados en la tabla `admins` pueden modificarlo. Lo garantizan las políticas RLS de Supabase, no el frontend.

## Correr en local

```bash
npm install
npm start
```

---

Hecho por [Agustín López](https://github.com/Agusslo)
