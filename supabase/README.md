# Supabase — Oro Lozano

## 1. Crear tablas (una sola vez)

1. Abre el proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor** → New query
3. Pega el contenido de `schema.sql`
4. Run

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa las keys.

## 3. Seed de datos de prueba

```bash
npm install
npm run seed:supabase
```

## 4. Storage

El bucket `products` se crea en el schema (o vía API). Las imágenes de producto se suben desde el atelier (`/api/admin/upload`).
