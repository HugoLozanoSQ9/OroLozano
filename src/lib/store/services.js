import { readJson, updateJson } from "./json-db";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function toPublic(user) {
  const { password, ...rest } = user;
  return rest;
}

export async function listUsers() {
  return readJson("users.json", []);
}

export async function findUserByUsername(username) {
  const users = await listUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function findUserById(id) {
  const users = await listUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(input) {
  const existing = await findUserByUsername(input.username);
  if (existing) throw new Error("El usuario ya existe");
  const user = {
    id: uid("usr"),
    username: input.username.trim().toLowerCase(),
    password: input.password,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role ?? "customer",
    createdAt: new Date().toISOString(),
  };
  await updateJson("users.json", [], (all) => [...all, user]);
  return user;
}

export async function listProducts(opts = {}) {
  const products = await readJson("products.json", []);
  if (opts.includeHidden) return products;
  return products.filter((p) => p.active);
}

export async function getProduct(id) {
  const products = await readJson("products.json", []);
  return products.find((p) => p.id === id);
}

export async function createProduct(input) {
  const product = {
    ...input,
    id: uid("prd"),
    createdAt: new Date().toISOString(),
  };
  await updateJson("products.json", [], (all) => [...all, product]);
  return product;
}

export async function updateProduct(id, patch) {
  let updated;
  await updateJson("products.json", [], (all) =>
    all.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, ...patch, id: p.id };
      return updated;
    }),
  );
  return updated;
}

export async function deleteProduct(id) {
  await updateJson("products.json", [], (all) => all.filter((p) => p.id !== id));
}

export async function getCart(userId) {
  const carts = await readJson("carts.json", []);
  return (
    carts.find((c) => c.userId === userId) ?? {
      userId,
      items: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function setCart(userId, items) {
  const next = { userId, items, updatedAt: new Date().toISOString() };
  await updateJson("carts.json", [], (all) => {
    const idx = all.findIndex((c) => c.userId === userId);
    if (idx === -1) return [...all, next];
    const copy = [...all];
    copy[idx] = next;
    return copy;
  });
  return next;
}

export async function listOrders(userId) {
  const orders = await readJson("orders.json", []);
  if (!userId) return orders;
  return orders.filter((o) => o.userId === userId);
}

export async function createOrder(order) {
  const full = {
    ...order,
    id: uid("ord"),
    status: "pagado",
    createdAt: new Date().toISOString(),
  };
  await updateJson("orders.json", [], (all) => [full, ...all]);
  return full;
}

export async function createSession(userId) {
  const session = {
    id: uid("ses"),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  };
  await updateJson("sessions.json", [], (all) => [
    ...all.filter((s) => new Date(s.expiresAt).getTime() > Date.now()),
    session,
  ]);
  return session;
}

export async function getSession(id) {
  const sessions = await readJson("sessions.json", []);
  const session = sessions.find((s) => s.id === id);
  if (!session) return undefined;
  if (new Date(session.expiresAt).getTime() < Date.now()) return undefined;
  return session;
}

export async function deleteSession(id) {
  await updateJson("sessions.json", [], (all) => all.filter((s) => s.id !== id));
}
