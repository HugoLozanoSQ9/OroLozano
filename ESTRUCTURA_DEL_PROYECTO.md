# Estructura del proyecto — Oro Lozano

Documento de referencia del sistema (v7/v8).

## Stack

- **Next.js** (Pages Router) + **Tailwind CSS**
- **Supabase** (Postgres + Storage)
- **Auth propia** con JWT + cookie + **bcrypt**
- Recuperación de contraseña por **OTP** al correo

## Árbol principal

```
OroLozano/
├── scripts/seed-supabase.mjs     # Seed (usuarios/productos hasheados)
├── supabase/
│   ├── schema.sql                # Schema base
│   └── migration_v7.sql          # admin_data (categorías, spot, margen, IVA)
├── src/
│   ├── components/
│   │   ├── AuthProvider.js       # Sesión global (JWT sessionStorage)
│   │   ├── CartDrawer.js         # Carrito flotante
│   │   ├── CertificateBadge.js   # Escudo certificado
│   │   ├── SiteChrome.js         # Header / footer / shell
│   │   ├── Toast.js              # Notificaciones
│   │   └── WhatsAppButton.js
│   ├── lib/store/
│   │   ├── supabase.js           # Cliente admin (secret key servidor)
│   │   ├── services.js           # Acceso a datos Supabase
│   │   ├── client.js             # fetch a /api/*
│   │   ├── password.js           # bcrypt hash/verify + OTP
│   │   ├── mail.js               # Resend o consola (pruebas)
│   │   ├── mx-validate.js        # Validaciones México + precio spot
│   │   ├── jwt.js / http.js / auth-client.js / order-status.js
│   └── pages/
│       ├── index.js, tienda/, producto/, carrito/
│       ├── cuenta/               # Login, registro, perfil, OTP, cambio pass
│       ├── admin/                # Atelier (modal piezas, certificados, pedidos)
│       ├── settings/             # Categorías + spot oro + margen/IVA
│       ├── certificado/[uuid].js
│       ├── guias/
│       └── api/                  # auth, products, cart, orders, admin, settings
└── ESTRUCTURA_DEL_PROYECTO.md
```

## Tablas Supabase

| Tabla | Uso |
|--------|-----|
| `users` | Cuentas, perfil, shipping JSONB |
| `products` | Piezas únicas, certificado, precio |
| `carts` | Carrito por usuario |
| `orders` | Pedidos eternos + status_history |
| `sessions` | Sesiones cookie |
| `password_resets` | OTP hasheados (15 min) |
| `admin_data` | Categorías, spot por K, margen, IVA |
| Storage `products` | Imágenes |

## Roles

- **customer** (`juan` / `uwu`): compra, perfil, envío MX, pedidos
- **admin** (`hugo` / `1`): Atelier + Settings (sin formulario de envío personal)

## Flujos clave

1. **Login** → bcrypt + JWT en sessionStorage + cookie  
2. **Registro** → password hasheado en Supabase  
3. **Olvidé contraseña** → OTP al correo (o consola sin RESEND_API_KEY)  
4. **Cambiar contraseña** (logueado) → actual + nueva, sin OTP  
5. **Precio pieza** → `spot(K) × peso × (1+margen%) × (1+IVA%)`  
6. **Pedidos** → estatus 1→5, no se borran  
7. **Piezas** → editar / ocultar (soft delete) / certificado  

## Setup

1. SQL: `schema.sql` luego `migration_v7.sql`  
2. `.env.local` con keys Supabase (+ opcional Resend)  
3. `npm install` → `npm run seed:supabase` → `npm run dev`  

## Seguridad (estado actual)

- Secret key solo en servidor  
- Passwords con bcrypt  
- OTP hasheado  
- Shipping **aún no cifrado** en BD (JSONB plano)  
