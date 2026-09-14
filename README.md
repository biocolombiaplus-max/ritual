# Ritual.com — Tienda online premium

Tienda e-commerce para productos de bienestar/placer para adultos, construida
con Next.js (App Router), Prisma + SQLite y Tailwind CSS. Incluye tienda
pública, carrito con upsell, cotizador de envíos por departamento/ciudad de
Colombia, checkout, y un panel administrativo completo para gestionar
productos, imágenes del sitio, importación masiva y pedidos.

## Requisitos

- Node.js 20+
- npm

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y edita las credenciales de administrador
npx prisma migrate deploy   # crea la base de datos SQLite
npx prisma db seed          # carga categorías y productos de ejemplo
npm run dev
```

Abre `http://localhost:3000` para la tienda y `http://localhost:3000/admin`
para el panel administrativo.

### Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Ruta del archivo SQLite (por defecto `file:./dev.db`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del panel administrativo |
| `AUTH_SECRET` | Secreto para firmar la sesión del admin (usa un valor largo y aleatorio en producción) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp (con indicativo, sin +) para confirmar pedidos |

**Cambia `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `AUTH_SECRET` antes de publicar el sitio.**

## Funcionalidades

### Tienda
- Home con banner principal editable, categorías, destacados y banner promocional.
- Catálogo (`/tienda`) con filtro por categoría y buscador.
- Página de producto con galería, upsell ("combina bien con esto") y aviso de envío gratis progresivo.
- Carrito persistente (localStorage) con barra de envío gratis y sugerencias de productos (cross-sell), igual que las grandes tiendas.
- Checkout con cotizador de envío por departamento/ciudad de Colombia (tarifas de referencia estilo Interrapidísimo/Servientrega) y envío gratis automático sobre $198.000.
- Confirmación del pedido con enlace directo a WhatsApp.
- Aviso de verificación de edad (+18) en la primera visita.
- Logos de métodos de pago (Visa, Mastercard, PSE, Nequi, Bancolombia, Daviplata, Addi, contraentrega).

### Panel administrativo (`/admin`)
- **Dashboard**: resumen de productos, pedidos y ventas.
- **Productos**: crear, editar, activar/desactivar y eliminar productos, con subida de múltiples imágenes por producto, precio, precio anterior (para mostrar descuento), stock, SKU, categoría y destacados.
- **Secciones e imágenes**: sube el logo de Ritual.com y edita las imágenes/textos del banner principal y del banner promocional del home, sin tocar código.
- **Importar productos**: sube un archivo y crea muchos productos a la vez (ver detalle abajo).
- **Pedidos**: lista de pedidos generados desde el checkout, con cambio de estado (pendiente, confirmado, enviado, entregado, cancelado).

## Importación masiva de productos — ¿qué archivo debo subir?

En `/admin/importar` puedes subir:

1. **CSV o Excel (recomendado)** — es la forma confiable de cargar todo
   automáticamente. Descarga la plantilla desde el propio panel
   (`/plantilla-productos-ritual.csv`), complétala en Excel o Google Sheets
   con una fila por producto (nombre, descripción, precio, categoría, stock,
   SKU, destacado) y súbela. El sistema crea los productos automáticamente
   y crea las categorías que no existan.
2. **PDF** — el sistema intenta leer el texto del PDF y extraer los
   productos, pero la lectura es aproximada (los PDF no tienen una
   estructura de datos fija como una hoja de cálculo). Funciona mejor si el
   PDF sigue un formato de bloques tipo `Campo: valor` (Nombre, Precio,
   Categoría, SKU, Stock, Descripción). Siempre revisa la vista previa
   editable antes de confirmar la importación.

**Sobre las imágenes:** ni un CSV ni un PDF pueden contener archivos de
imagen embebidos, así que hay dos formas de asociarlas:

- Si ya tienes las fotos publicadas en internet, pon el enlace (URL) en la
  columna `imagen_url` del CSV/Excel y se asignarán automáticamente.
- Si no, deja esa columna vacía, importa el resto de los datos, y luego
  sube las fotos producto por producto desde **Productos → Editar** (arrastra
  o selecciona las imágenes, se suben directo al servidor).

## Cotizador de envíos

`src/lib/colombia.ts` contiene los 32 departamentos de Colombia (más
Bogotá D.C.) con sus principales ciudades y una tarifa de referencia por
"nivel" de cobertura (capital, ciudad intermedia, municipio apartado, zona
especial). Son tarifas **estimadas** inspiradas en rangos públicos de
transportadoras como Interrapidísimo y Servientrega para paquetes
pequeños. Para tarifas exactas en tiempo real, el siguiente paso es
integrar la API oficial de la transportadora elegida — el cotizador ya
está aislado en ese archivo para conectarlo fácilmente.

## Limitaciones conocidas / próximos pasos para producción

- **Base de datos**: se usa SQLite en un archivo local, ideal para
  desarrollo y demostraciones. Para producción en un hosting serverless
  (Vercel, etc.) se recomienda migrar a Postgres/MySQL administrado (el
  `schema.prisma` se adapta cambiando el `provider` y el `DATABASE_URL`).
- **Imágenes subidas**: se guardan en `public/uploads` en el propio
  servidor. En hostings con sistema de archivos efímero (como la mayoría
  de plataformas serverless) esto no persiste entre despliegues — para
  producción se recomienda conectar un almacenamiento en la nube (S3,
  Cloudinary, Vercel Blob, etc.).
- **Pagos**: el checkout captura el pedido y muestra los métodos de pago
  aceptados, pero el cobro se coordina por WhatsApp. Para cobro en línea
  inmediato (tarjetas, PSE) se recomienda integrar una pasarela como
  Wompi, PayU o ePayco con sus credenciales de comercio.
- La librería `xlsx` (SheetJS) usada para leer archivos Excel tiene
  advisories de seguridad conocidos sin parche en npm; el riesgo es bajo
  porque solo procesa archivos que el propio administrador sube desde el
  panel autenticado, pero si vas a aceptar archivos de terceros conviene
  revisarlo o sustituirlo.

## Estructura del proyecto

```
prisma/            Esquema de base de datos y seed de datos de ejemplo
src/app/            Páginas (tienda) y rutas /admin y /api
src/components/     Componentes de la tienda
src/components/admin/  Componentes del panel administrativo
src/lib/            Utilidades: prisma, auth, colombia (envíos), import, formato
src/store/          Estado del carrito (Zustand + localStorage)
scripts/            Utilidades de desarrollo (generación de imágenes placeholder)
public/seed/        Imágenes de referencia usadas por el seed
public/uploads/     Imágenes subidas desde el panel administrativo
```
