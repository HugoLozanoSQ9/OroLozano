import { currentUserFromRequest, json } from "@/lib/store/http";
import {
  createOrder,
  getCart,
  getProduct,
  listOrders,
  setCart,
  updateProduct,
} from "@/lib/store/services";

export default async function handler(req, res) {
  const user = await currentUserFromRequest(req);
  if (!user) return json(res, { error: "Inicia sesión" }, 401);

  if (req.method === "GET") {
    const orders = await listOrders(user.role === "admin" ? undefined : user.id);
    return json(res, { orders });
  }

  if (req.method === "POST") {
    if (user.role === "admin") {
      return json(res, { error: "Usa una cuenta de cliente" }, 403);
    }
    const cart = await getCart(user.id);
    if (cart.items.length === 0) return json(res, { error: "El carrito está vacío" }, 400);
    const lines = [];
    let total = 0;
    for (const item of cart.items) {
      const product = await getProduct(item.productId);
      if (!product) continue;
      if (product.stock < 1) {
        return json(res, { error: `Pieza no disponible: ${product.name}` }, 400);
      }
      lines.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        certificateUuid: product.certificate?.uuid,
        serial: product.certificate?.serial,
      });
      total += product.price;
    }
    for (const line of lines) {
      await updateProduct(line.productId, { stock: 0, active: false });
    }
    const body = req.body || {};
    const order = await createOrder({
      userId: user.id,
      items: lines,
      total,
      shippingName: body.shippingName || body.shipping?.fullName || user.name,
      shippingCity: body.shippingCity || body.shipping?.city || "",
      shipping: body.shipping || user.shipping || {},
    });
    await setCart(user.id, []);
    return json(res, { order }, 201);
  }

  return json(res, { error: "Método no permitido" }, 405);
}
