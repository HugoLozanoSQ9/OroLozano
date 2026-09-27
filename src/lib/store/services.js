import crypto from "node:crypto";
import { getAdminClient, publicImageUrl } from "./supabase";
import { hashPassword, verifyPassword, generateOtp } from "./password";
import { sendPasswordOtpEmail } from "./mail";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function newUuid() {
  return crypto.randomUUID();
}

function sb() {
  return getAdminClient();
}

/* ---------- mappers ---------- */

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || "",
    role: row.role || "customer",
    shipping: row.shipping || {},
    createdAt: row.created_at,
  };
}

function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description || "",
    details: row.details || "",
    metal: row.metal,
    purity: row.purity || row.karat,
    karat: row.karat || row.purity,
    weightGrams: Number(row.weight_grams ?? 0),
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    image: row.image || "",
    images: row.images || [],
    featured: Boolean(row.featured),
    active: row.active !== false,
    stones: row.stones || "none",
    stonesNote: row.stones_note || "",
    certificate: row.certificate || null,
    createdAt: row.created_at,
  };
}

function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    items: row.items || [],
    total: Number(row.total ?? 0),
    status: row.status || "recibido",
    statusHistory: row.status_history || [],
    shippingName: row.shipping_name || "",
    shippingCity: row.shipping_city || "",
    shipping: row.shipping || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export function toPublic(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

/* ---------- users ---------- */

export async function listUsers() {
  const { data, error } = await sb().from("users").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map(mapUser);
}

export async function findUserByUsername(username) {
  const { data, error } = await sb()
    .from("users")
    .select("*")
    .ilike("username", username.trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return mapUser(data);
}

export async function findUserById(id) {
  const { data, error } = await sb().from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return mapUser(data);
}

export async function createUser(input) {
  const existing = await findUserByUsername(input.username);
  if (existing) throw new Error("El usuario ya existe");
  const hashed = await hashPassword(input.password);
  const user = {
    id: uid("usr"),
    username: input.username.trim().toLowerCase(),
    password: hashed,
    name: (input.name || "").trim(),
    email: (input.email || "").trim().toLowerCase(),
    phone: "",
    role: input.role ?? "customer",
    shipping: {
      fullName: (input.name || "").trim(),
      phone: "",
      street: "",
      extNumber: "",
      intNumber: "",
      neighborhood: "",
      city: "",
      state: "",
      zip: "",
      references: "",
      betweenStreets: "",
    },
    created_at: new Date().toISOString(),
  };
  const { data, error } = await sb()
    .from("users")
    .insert({
      id: user.id,
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      shipping: user.shipping,
      created_at: user.created_at,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapUser(data);
}

export async function updateUser(id, patch) {
  const current = await findUserById(id);
  if (!current) return null;
  const next = {
    name: patch.name ?? current.name,
    email: patch.email ?? current.email,
    phone: patch.phone !== undefined ? patch.phone : current.phone,
    shipping: patch.shipping
      ? { ...(current.shipping || {}), ...patch.shipping }
      : current.shipping || {},
  };
  let passwordUpdate = {};
  if (patch.password) {
    passwordUpdate.password = await hashPassword(patch.password);
  }
  const { data, error } = await sb()
    .from("users")
    .update({
      name: next.name,
      email: next.email,
      phone: next.phone,
      shipping: next.shipping,
      ...passwordUpdate,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapUser(data);
}

/* ---------- products ---------- */

export async function listProducts(opts = {}) {
  let q = sb().from("products").select("*").order("created_at", { ascending: false });
  if (!opts.includeHidden) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map(mapProduct);
}

export async function getProduct(id) {
  const { data, error } = await sb().from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return mapProduct(data);
}

export async function getProductByCertificateUuid(uuid) {
  const { data, error } = await sb()
    .from("products")
    .select("*")
    .filter("certificate->>uuid", "eq", uuid)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return mapProduct(data);
}

export async function createProduct(input) {
  const hasCertInput =
    input.certificate &&
    (input.certificate.uuid || input.certificate.density || input.certificate.touchstone);
  let certificate = null;
  if (hasCertInput) {
    const certificateUuid = input.certificate?.uuid || newUuid();
    certificate = {
      uuid: certificateUuid,
      serial: input.certificate?.serial || `OL-${certificateUuid.slice(0, 8).toUpperCase()}`,
      weightGrams: Number(input.weightGrams ?? input.certificate?.weightGrams ?? 0),
      density: Number(input.certificate?.density ?? 0),
      densityMethod: input.certificate?.densityMethod || "densímetro",
      touchstone: input.certificate?.touchstone || "",
      ultrasound: input.certificate?.ultrasound || "",
      tests: input.certificate?.tests || {
        touchstone: true,
        densimeter: true,
        ultrasound: true,
      },
      notes: input.certificate?.notes || "",
      issuedAt: new Date().toISOString(),
      issuedBy: "Oro Lozano Atelier",
    };
  }
  const id = uid("prd");
  const row = {
    id,
    name: input.name,
    slug: input.slug || String(input.name || "").toLowerCase().replace(/\s+/g, "-"),
    category: input.category || "anillos",
    description: input.description || "",
    details: input.details || "",
    metal: input.metal || "Oro amarillo",
    purity: input.purity || input.karat || "18k",
    karat: input.purity || input.karat || "18k",
    weight_grams: Number(input.weightGrams ?? 0),
    price: Number(input.price),
    stock: 1,
    image: input.image || "/products/anillo-sello.svg",
    images: input.images || [input.image || "/products/anillo-sello.svg"],
    featured: Boolean(input.featured),
    active: input.active !== false,
    stones: "none",
    stones_note: "Sin piedras. Piezas con piedras solo sobre pedido.",
    certificate,
    price_breakdown: input.priceBreakdown || null,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await sb().from("products").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return mapProduct(data);
}

export async function updateProduct(id, patch) {
  const current = await getProduct(id);
  if (!current) return null;
  const update = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.details !== undefined) update.details = patch.details;
  if (patch.metal !== undefined) update.metal = patch.metal;
  if (patch.purity !== undefined || patch.karat !== undefined) {
    update.purity = patch.purity || patch.karat;
    update.karat = patch.purity || patch.karat;
  }
  if (patch.weightGrams !== undefined) update.weight_grams = Number(patch.weightGrams);
  if (patch.price !== undefined) update.price = Number(patch.price);
  if (patch.stock !== undefined) update.stock = Number(patch.stock);
  if (patch.image !== undefined) update.image = patch.image;
  if (patch.images !== undefined) update.images = patch.images;
  if (patch.featured !== undefined) update.featured = Boolean(patch.featured);
  if (patch.active !== undefined) update.active = Boolean(patch.active);
  if (patch.priceBreakdown !== undefined) update.price_breakdown = patch.priceBreakdown;
  if (patch.certificate) {
    const prev = current.certificate || {};
    const cert = { ...prev, ...patch.certificate };
    if (!cert.uuid) cert.uuid = newUuid();
    if (!cert.serial) cert.serial = `OL-${cert.uuid.slice(0, 8).toUpperCase()}`;
    if (!cert.issuedAt) cert.issuedAt = new Date().toISOString();
    if (!cert.issuedBy) cert.issuedBy = "Oro Lozano Atelier";
    update.certificate = cert;
    if (cert.weightGrams != null) update.weight_grams = Number(cert.weightGrams);
  }
  const { data, error } = await sb().from("products").update(update).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return mapProduct(data);
}

export async function deleteProduct(id) {
  const { error } = await sb().from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------- carts ---------- */

export async function getCart(userId) {
  const { data, error } = await sb().from("carts").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    return { userId, items: [], updatedAt: new Date().toISOString() };
  }
  return {
    userId: data.user_id,
    items: data.items || [],
    updatedAt: data.updated_at,
  };
}

export async function setCart(userId, items) {
  const row = {
    user_id: userId,
    items,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb()
    .from("carts")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return {
    userId: data.user_id,
    items: data.items || [],
    updatedAt: data.updated_at,
  };
}

/* ---------- orders ---------- */

export async function listOrders(userId) {
  let q = sb().from("orders").select("*").order("created_at", { ascending: false });
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data || []).map(mapOrder);
}

export async function createOrder(order) {
  const status = order.status || "recibido";
  const row = {
    id: uid("ord"),
    user_id: order.userId,
    items: order.items || [],
    total: Number(order.total || 0),
    status,
    status_history: [
      {
        status,
        at: new Date().toISOString(),
        note: "Pedido registrado",
      },
    ],
    shipping_name: order.shippingName || "",
    shipping_city: order.shippingCity || "",
    shipping: order.shipping || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb().from("orders").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return mapOrder(data);
}

export async function updateOrderStatus(orderId, status, note = "") {
  const { data: current, error: readErr } = await sb()
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!current) return null;
  const history = Array.isArray(current.status_history) ? [...current.status_history] : [];
  history.push({ status, at: new Date().toISOString(), note: note || "" });
  const { data, error } = await sb()
    .from("orders")
    .update({
      status,
      status_history: history,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapOrder(data);
}

/* ---------- sessions ---------- */

export async function createSession(userId) {
  const session = {
    id: uid("ses"),
    user_id: userId,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  };
  const { data, error } = await sb().from("sessions").insert(session).select("*").single();
  if (error) throw new Error(error.message);
  return mapSession(data);
}

export async function getSession(id) {
  const { data, error } = await sb().from("sessions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  if (new Date(data.expires_at).getTime() < Date.now()) return undefined;
  return mapSession(data);
}

export async function deleteSession(id) {
  const { error } = await sb().from("sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Upload product image buffer to Storage bucket `products`. Returns public URL. */
export async function uploadProductImage(filename, buffer, contentType = "image/jpeg") {
  const path = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await sb().storage.from("products").upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = sb().storage.from("products").getPublicUrl(path);
  return data.publicUrl;
}


export async function findUserByEmail(email) {
  const { data, error } = await sb()
    .from("users")
    .select("*")
    .ilike("email", String(email).trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return mapUser(data);
}

export async function requestPasswordReset(email) {
  const user = await findUserByEmail(email);
  // Respuesta genérica siempre (no revelar si el correo existe)
  if (!user) {
    return { ok: true };
  }
  const otp = generateOtp(6);
  const otpHash = await hashPassword(otp);
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  // Invalidar OTPs previos no usados
  await sb()
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("email", user.email)
    .is("used_at", null);

  const { error } = await sb().from("password_resets").insert({
    id: uid("rst"),
    user_id: user.id,
    email: user.email,
    otp_hash: otpHash,
    expires_at: expires,
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  await sendPasswordOtpEmail({ to: user.email, name: user.name, otp });
  return { ok: true };
}

export async function resetPasswordWithOtp({ email, otp, newPassword }) {
  if (!email || !otp || !newPassword) {
    throw new Error("Correo, OTP y nueva contraseña son requeridos");
  }
  if (String(newPassword).length < 4) {
    throw new Error("La contraseña debe tener al menos 4 caracteres");
  }
  const normalized = String(email).trim().toLowerCase();
  const { data: rows, error } = await sb()
    .from("password_resets")
    .select("*")
    .eq("email", normalized)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) {
    throw new Error("Código inválido o expirado");
  }
  const now = Date.now();
  let matched = null;
  for (const row of rows) {
    if (new Date(row.expires_at).getTime() < now) continue;
    const ok = await verifyPassword(otp, row.otp_hash);
    if (ok) {
      matched = row;
      break;
    }
  }
  if (!matched) throw new Error("Código inválido o expirado");

  const hashed = await hashPassword(newPassword);
  const { error: upErr } = await sb()
    .from("users")
    .update({ password: hashed })
    .eq("id", matched.user_id);
  if (upErr) throw new Error(upErr.message);

  await sb()
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("id", matched.id);

  return { ok: true };
}


/* ---------- admin_data (settings / categories / spot) ---------- */

const DEFAULT_ADMIN_DATA = {
  id: "main",
  categories: [
    { id: "anillos", name: "Anillos", slug: "anillos" },
    { id: "collares", name: "Collares", slug: "collares" },
    { id: "aretes", name: "Aretes", slug: "aretes" },
    { id: "pulseras", name: "Pulseras", slug: "pulseras" },
  ],
  gold_spot_by_karat: {},
  margin_percent: 35,
  iva_percent: 16,
};

export async function getAdminData() {
  const { data, error } = await sb().from("admin_data").select("*").eq("id", "main").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const { data: created, error: insErr } = await sb()
      .from("admin_data")
      .upsert({ ...DEFAULT_ADMIN_DATA, updated_at: new Date().toISOString() }, { onConflict: "id" })
      .select("*")
      .single();
    if (insErr) throw new Error(insErr.message);
    return mapAdminData(created);
  }
  return mapAdminData(data);
}

function mapAdminData(row) {
  return {
    id: row.id,
    categories: row.categories || DEFAULT_ADMIN_DATA.categories,
    goldSpotByKarat: row.gold_spot_by_karat || {},
    marginPercent: Number(row.margin_percent ?? 35),
    ivaPercent: Number(row.iva_percent ?? 16),
    updatedAt: row.updated_at,
  };
}

export async function updateAdminData(patch) {
  const current = await getAdminData();
  const row = {
    id: "main",
    categories: patch.categories ?? current.categories,
    gold_spot_by_karat: patch.goldSpotByKarat ?? current.goldSpotByKarat,
    margin_percent: patch.marginPercent ?? current.marginPercent,
    iva_percent: patch.ivaPercent ?? current.ivaPercent,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb().from("admin_data").upsert(row, { onConflict: "id" }).select("*").single();
  if (error) throw new Error(error.message);
  return mapAdminData(data);
}

export async function softDeleteProduct(id) {
  return updateProduct(id, { active: false, stock: 0 });
}


export { verifyPassword, publicImageUrl };
