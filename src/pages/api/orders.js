import { currentUserFromRequest, json } from "@/lib/store/http";
import {
  createOrder,
  getCart,
  getProduct,
  listOrders,
  setCart,
  markProductSold,
  updateOrderShipping,
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
      if (product.stock < 1 || product.sold) {
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
    if (lines.length === 0) return json(res, { error: "No hay piezas válidas en el carrito" }, 400);

    for (const line of lines) {
      await markProductSold(line.productId);
    }

    const body = req.body || {};
    const shipping = body.shipping || {};
    const order = await createOrder({
      userId: user.id,
      items: lines,
      total,
      shippingName: body.shippingName || shipping.fullName || user.name,
      shippingCity: body.shippingCity || shipping.city || "",
      shipping,
    });
    await setCart(user.id, []);
    return json(res, { order }, 201);
  }

  // Cliente actualiza envío de un pedido propio (aún editable)
  if (req.method === "PATCH") {
    if (user.role === "admin") {
      return json(res, { error: "Usa el panel de atelier" }, 403);
    }
    const orderId = req.body?.orderId || req.body?.id;
    const shipping = req.body?.shipping;
    if (!orderId || !shipping) {
      return json(res, { error: "orderId y shipping son requeridos" }, 400);
    }
    const orders = await listOrders(user.id);
    const mine = orders.find((o) => o.id === orderId);
    if (!mine) return json(res, { error: "Pedido no encontrado" }, 404);
    try {
      const order = await updateOrderShipping(
        orderId,
        shipping,
        shipping.fullName,
        shipping.city,
      );
      return json(res, { order });
    } catch (e) {
      return json(res, { error: e.message }, 400);
    }
  }

  return json(res, { error: "Método no permitido" }, 405);
}
