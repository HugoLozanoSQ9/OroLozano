async function request(url, init) {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Error de servidor");
  return body;
}

export const api = {
  me: () => request("/api/auth/me"),
  login: (username, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (data) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  products: () => request("/api/products"),
  product: (id) => request(`/api/products/${id}`),
  cart: () => request("/api/cart"),
  addToCart: (productId, quantity = 1) =>
    request("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCart: (productId, quantity) =>
    request("/api/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    }),
  checkout: (shippingName, shippingCity) =>
    request("/api/orders", {
      method: "POST",
      body: JSON.stringify({ shippingName, shippingCity }),
    }),
  orders: () => request("/api/orders"),
  adminProducts: () => request("/api/admin/products"),
  adminCreateProduct: (product) =>
    request("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  adminUpdateProduct: (id, product) =>
    request(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
  adminDeleteProduct: (id) =>
    request(`/api/admin/products/${id}`, { method: "DELETE" }),
  adminOrders: () => request("/api/admin/orders"),
};

export function formatMxn(cents) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
