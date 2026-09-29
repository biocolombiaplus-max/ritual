# Ritual.com — Tienda online premium

Tienda e-commerce para productos de bienestar/placer para adultos, construida
con Next.js (App Router), Prisma + PostgreSQL y Tailwind CSS. Incluye tienda
pública, carrito con upsell, cotizador de envíos por departamento/ciudad de
Colombia, checkout, y un panel administrativo completo para gestionar
productos, imágenes del sitio, importación masiva y pedidos.

Lista para desplegar en **Vercel** con base de datos Postgres (Neon) y
almacenamiento de imágenes en **Vercel Blob** — ver la guía de despliegue más
abajo.

## Requisitos

- Node.js 20+
- npm
- Una base de datos PostgreSQL (local para desarrollar, o gratis en la nube — ver despliegue)

## Puesta en marcha local

```bash
npm install
cp .env.example .env   # completa DATABASE_URL y las credenciales de administrador
npx prisma migrate dev # crea las tablas
npx prisma db seed     # carga categorías y productos de ejemplo
npm run dev
```

Abre `http://localhost:3000` para la tienda y `http://localhost:3000/admin`
para el panel administrativo.

### Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del panel administrativo |
| `AUTH_SECRET` | Secreto para firmar la sesión del admin (usa un valor largo y aleatorio en producción) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp (con indicativo, sin +) para confirmar pedidos |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob para guardar imágenes subidas. Vacío en local (se guardan en `public/uploads`); en Vercel se agrega solo al crear el Blob Store |
| `ANTHROPIC_API_KEY` | Opcional. Activa el botón "✨ IA" de Carga rápida (autocompletar nombre/categoría/descripción desde la foto). Sin ella, todo lo demás funciona igual |

**Cambia `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `AUTH_SECRET` antes de publicar el sitio.**

---

## 🚀 Desplegar en Vercel (paso a paso)

El proyecto ya está preparado para producción: base de datos Postgres,
imágenes en Vercel Blob, y el build corre las migraciones automáticamente
(`prisma generate && prisma migrate deploy && next build`).

### 1. Crea la base de datos (Neon Postgres, gratis)

1. Entra a [vercel.com](https://vercel.com) e inicia sesión (o crea una cuenta gratis con tu correo o GitHub).
2. En el dashboard, ve a la pestaña **Storage** → **Create Database** → elige **Neon (Postgres)** → plan gratuito → créala.
3. Copia la variable `DATABASE_URL` que te muestra (la necesitarás en el paso 4; si conectas la base al proyecto en el paso 3, Vercel ya la agrega sola).

### 2. Crea el almacenamiento de imágenes (Vercel Blob)

1. En la misma pestaña **Storage** → **Create Database** → elige **Blob**.
2. Créalo y consérvalo — cuando lo conectes a tu proyecto (paso 3), Vercel agrega automáticamente la variable `BLOB_READ_WRITE_TOKEN`.

### 3. Importa el proyecto desde GitHub

1. En Vercel, click **Add New** → **Project**.
2. Selecciona el repositorio `biocolombiaplus-max/ritual` (autoriza acceso a GitHub si te lo pide).
3. En **Branch**, elige la rama con el código (`claude/pensive-johnson-5cv8he`, o la rama `main` si ya hiciste merge).
4. En **Environment Variables**, agrega (si no quedaron ya por conectar la base/Blob en los pasos 1-2):

   | Nombre | Valor |
   |---|---|
   | `DATABASE_URL` | la de tu base Neon |
   | `ADMIN_EMAIL` | tu correo de administrador |
   | `ADMIN_PASSWORD` | una clave segura (no uses la de prueba) |
   | `AUTH_SECRET` | una cadena larga y aleatoria (por ejemplo, generada con `openssl rand -base64 32`) |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | tu número de WhatsApp con indicativo, sin `+` (ej. `573001234567`) |
   | `BLOB_READ_WRITE_TOKEN` | se agrega solo si conectaste el Blob Store al proyecto |

5. Click **Deploy**. Vercel instala dependencias, corre `prisma migrate deploy` (crea las tablas en tu base Neon) y compila el sitio.
6. Al terminar te da un link público tipo `https://ritual-xxxx.vercel.app` — ¡ese ya lo puedes compartir!

### 4. Carga tus productos de ejemplo (opcional, una sola vez)

Para que la tienda no se vea vacía al abrirla, corre el seed **apuntando a tu base de producción** desde tu computador:

```bash
DATABASE_URL="la-misma-url-de-neon-que-usaste-en-vercel" npx prisma db seed
```

Esto carga las 7 categorías y 16 productos de ejemplo con textos y precios
reales, listos para reemplazar por los tuyos desde el panel `/admin`.
Si prefieres empezar desde cero, sáltate este paso y agrega tus productos
directamente en `/admin/productos` o con la importación masiva.

### 5. (Opcional) Dominio propio

En el proyecto de Vercel → **Settings** → **Domains**, agrega tu dominio
(por ejemplo `ritual.com`) y sigue las instrucciones para apuntar los DNS.
Sin esto, el link `https://ritual-xxxx.vercel.app` ya es público y funcional.

### Cada vez que quieras actualizar el sitio

Vercel vuelve a desplegar automáticamente cada vez que se hace push a la
rama conectada — no necesitas repetir estos pasos.

---

## Funcionalidades

### Tienda
- Home premium con banner principal, barra de beneficios, categorías, sección "cómo funciona tu pedido discreto" (proceso de compra en pasos), destacados, "Nuestra filosofía" (historia de marca), recién llegados, testimonios, banner promocional y captura de newsletter — todo editable desde el admin, sin tocar código.
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
- **⚡ Carga rápida** (`/admin/productos/carga-rapida`): el flujo tipo "subir muchas fotos y publicar rápido" de las grandes tiendas online. Eliges de una vez todas las fotos de productos que tengas (por ejemplo, las que te llegan por WhatsApp), las agrupas tocándolas (varias fotos de un mismo producto, o "cada foto = 1 producto"), completas nombre/categoría/precio en la tarjeta de cada borrador y publicas todo con un solo botón. Con `ANTHROPIC_API_KEY` configurada, el botón "✨ IA" mira la foto y sugiere nombre, categoría y descripción automáticamente — siempre revisables antes de publicar.
- **Secciones e imágenes**: sube el logo de Ritual.com y edita las imágenes/textos del banner principal, la sección "Nuestra filosofía" (marca), el banner promocional y el newsletter — todo sin tocar código.
- **Contenido de inicio** (`/admin/contenido`): administra la barra de beneficios, los pasos de "cómo funciona tu pedido" y los testimonios que aparecen en la home — agregar, editar, reordenar, ocultar o eliminar cada uno.
- **Importar productos**: sube un archivo y crea muchos productos a la vez (ver detalle abajo).
- **Pedidos**: lista de pedidos generados desde el checkout, con cambio de estado (pendiente, confirmado, enviado, entregado, cancelado), alerta sonora/notificación cuando entra uno nuevo, y creación de pedidos manuales (`/admin/pedidos/nuevo`) para ventas por WhatsApp o Instagram.

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
  o selecciona las imágenes; en producción se guardan en Vercel Blob).

## Cotizador de envíos

`src/lib/colombia.ts` contiene los 32 departamentos de Colombia (más
Bogotá D.C.) con sus principales ciudades y una tarifa de referencia por
"nivel" de cobertura (capital, ciudad intermedia, municipio apartado, zona
especial). Son tarifas **estimadas** inspiradas en rangos públicos de
transportadoras como Interrapidísimo y Servientrega para paquetes
pequeños. Para tarifas exactas en tiempo real, el siguiente paso es
integrar la API oficial de la transportadora elegida — el cotizador ya
está aislado en ese archivo para conectarlo fácilmente.

## Limitaciones conocidas / próximos pasos

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
prisma/            Esquema de base de datos (PostgreSQL) y seed de datos de ejemplo
src/app/            Páginas (tienda) y rutas /admin y /api
src/components/     Componentes de la tienda
src/components/admin/  Componentes del panel administrativo
src/lib/            Utilidades: prisma, auth, colombia (envíos), import, formato
src/store/          Estado del carrito (Zustand + localStorage)
scripts/            Utilidades de desarrollo (generación de imágenes placeholder)
public/seed/        Imágenes de referencia usadas por el seed
public/uploads/     Imágenes subidas en desarrollo local (en producción se usa Vercel Blob)
```
