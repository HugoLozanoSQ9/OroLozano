import { createClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

const secretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!url) {
  console.warn("[orolozano] SUPABASE_URL is not set");
}

/** Server-side admin client — bypasses RLS. Never import in browser code. */
export function getAdminClient() {
  if (!url || !secretKey) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en el servidor");
  }
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Browser/safe client (publishable). Optional for future client queries. */
export function getPublicClient() {
  if (!url || !publishableKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o PUBLISHABLE_KEY");
  }
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return `${url}/storage/v1/object/public/products/${path.replace(/^\/+/, "")}`;
}
