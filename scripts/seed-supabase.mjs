/**
 * Seed Oro Lozano data into Supabase.
 * Requires tables from supabase/schema.sql already applied.
 *
 * Usage: node --env-file=.env.local scripts/seed-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function load(name) {
  return JSON.parse(readFileSync(join(root, "data", name), "utf8"));
}

async function upsert(table, rows, onConflict = "id") {
  if (!rows.length) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table}: ${rows.length} rows`);
}

const users = load("users.json").map((u) => ({
  id: u.id,
  username: u.username,
  password: u.password,
  name: u.name || "",
  email: u.email || "",
  phone: u.phone || "",
  role: u.role || "customer",
  shipping: u.shipping || {},
  created_at: u.createdAt || new Date().toISOString(),
}));

const products = load("products.json").map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category: p.category,
  description: p.description || "",
  details: p.details || "",
  metal: p.metal,
  purity: p.purity || p.karat,
  karat: p.karat || p.purity,
  weight_grams: p.weightGrams ?? 0,
  price: p.price,
  stock: p.stock ?? 1,
  image: p.image || "",
  images: p.images || [p.image],
  featured: Boolean(p.featured),
  active: p.active !== false,
  stones: p.stones || "none",
  stones_note: p.stonesNote || "",
  certificate: p.certificate || null,
  created_at: p.createdAt || new Date().toISOString(),
}));

const carts = load("carts.json").map((c) => ({
  user_id: c.userId,
  items: c.items || [],
  updated_at: c.updatedAt || new Date().toISOString(),
}));

const orders = load("orders.json").map((o) => ({
  id: o.id,
  user_id: o.userId,
  items: o.items || [],
  total: o.total || 0,
  status: o.status === "pagado" ? "recibido" : o.status || "recibido",
  status_history: o.statusHistory || [
    {
      status: o.status === "pagado" ? "recibido" : o.status || "recibido",
      at: o.createdAt || new Date().toISOString(),
      note: "Migrado",
    },
  ],
  shipping_name: o.shippingName || "",
  shipping_city: o.shippingCity || "",
  shipping: o.shipping || {},
  created_at: o.createdAt || new Date().toISOString(),
  updated_at: o.updatedAt || o.createdAt || new Date().toISOString(),
}));

const sessions = load("sessions.json").map((s) => ({
  id: s.id,
  user_id: s.userId,
  created_at: s.createdAt || new Date().toISOString(),
  expires_at: s.expiresAt,
}));

try {
  await upsert("users", users);
  await upsert("products", products);
  // carts reference users
  if (carts.length) await upsert("carts", carts, "user_id");
  await upsert("orders", orders);
  if (sessions.length) await upsert("sessions", sessions);
  console.log("\nSeed completo.");
} catch (e) {
  console.error("\nSeed falló:", e.message);
  console.error(
    "\n¿Ya corriste supabase/schema.sql en el SQL Editor del dashboard?",
  );
  process.exit(1);
}
