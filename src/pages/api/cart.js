import { currentUserFromRequest, json } from "@/lib/store/http";
import { getCart, getProduct, listProducts, setCart } from "@/lib/store/services";

export default async function handler(req, res) {
  const user = await currentUserFromRequest(req);
  if (!user) return json(res, { error: "Inicia sesión" }, 401);

  if (req.method === "GET") {
    const cart = await getCart(user.id);
    const products = await listProducts({ includeHidden: true });
    return json(res, { cart, products });
  }

  if (req.method === "POST") {
    if (user.role === "admin") {
      return json(res, { error: "El admin no compra desde esta cuenta" }, 403);
    }
    const productId = req.body?.productId;
    const quantity = Math.max(1, req.body?.quantity ?? 1);
    if (!productId) return json(res, { error: "Producto requerido" }, 400);
    const product = await getProduct(productId);
    if (!product) return json(res, { error: "Producto no existe" }, 404);
    const cart = await getCart(user.id);
    const existing = cart.items.find((i) => i.productId === productId);
    const items = existing
      ? cart.items.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...cart.items, { productId, quantity }];
    const next = await setCart(user.id, items);
    return json(res, { cart: next });
  }

  if (req.method === "PUT") {
    const productId = req.body?.productId;
    const quantity = req.body?.quantity ?? 0;
    if (!productId) return json(res, { error: "Producto requerido" }, 400);
    const cart = await getCart(user.id);
    const items =
      quantity <= 0
        ? cart.items.filter((i) => i.productId !== productId)
        : cart.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          );
    const next = await setCart(user.id, items);
    return json(res, { cart: next });
  }

  return json(res, { error: "Método no permitido" }, 405);
}
