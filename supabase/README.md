# Supabase — Oro Lozano

## 1. Schema (obligatorio, una vez)

1. Dashboard Supabase → **SQL Editor** → New query  
2. Pega **todo** `schema.sql`  
3. **Run**

## 2. Variables `.env.local` (raíz del proyecto)

Ver `.env.example`. Incluye opcionalmente:

```env
RESEND_API_KEY=re_xxx
MAIL_FROM=Oro Lozano <tu@dominio.com>
```

Sin `RESEND_API_KEY`, el OTP de recuperación se imprime en la **consola del servidor** (`npm run dev`).

## 3. Seed — ¿dónde se ejecuta?

En la **terminal de tu máquina**, dentro de la carpeta del proyecto (donde está `package.json`):

```powershell
cd C:\Users\Hugo\Desktop\orolozano
npm install
npm run seed:supabase
```

Eso corre `scripts/seed-supabase.mjs` y sube usuarios/productos a Supabase  
(contraseñas **hasheadas** con bcrypt: `hugo/1`, `juan/uwu`).

**No** se ejecuta dentro del SQL Editor.

## 4. Storage

Bucket `products` (imágenes). Subida desde el Atelier con `<input type="file">`.
