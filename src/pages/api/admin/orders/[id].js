import { currentUserFromRequest, json } from "@/lib/store/http";
import {
  updateOrderStatus,
  releaseProduct,
  updateOrderShipping,
  listOrders,
} from "@/lib/store/services";
import { ORDER_STATUSES } from "@/lib/store/order-status";

const ALLOWED = new Set(ORDER_STATUSES.map((s) => s.id));

export default async function handler(req, res) {
  const user = await currentUserFromRequest(req);
  if (!user || user.role !== "admin") return json(res, { error: "No autorizado" }, 403);
  const { id } = req.query;

  if (req.method === "PATCH" || req.method === "PUT") {
    const body = req.body || {};

    // Liberar productos de un pedido cancelado
    if (body.action === "release_products") {
      const orders = await listOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) return json(res, { error: "Pedido no encontrado" }, 404);
      if (order.status !== "cancelado") {
        return json(res, { error: "Solo se liberan piezas de pedidos cancelados" }, 400);
      }
      for (const item of order.items || []) {
        if (item.productId) await releaseProduct(item.productId);
      }
      return json(res, { ok: true, message: "Piezas liberadas al catálogo" });
    }

    // Actualizar envío
    if (body.shipping) {
      try {
        const order = await updateOrderShipping(
          id,
          body.shipping,
          body.shippingName || body.shipping.fullName,
          body.shippingCity || body.shipping.city,
        );
        if (!order) return json(res, { error: "Pedido no encontrado" }, 404);
        return json(res, { order });
      } catch (e) {
        return json(res, { error: e.message }, 400);
      }
    }

    const status = body.status;
    const note = body.note || "";
    if (!status || !ALLOWED.has(status)) {
      return json(res, { error: "Estatus inválido" }, 400);
    }
    try {
      const order = await updateOrderStatus(id, status, note);
      if (!order) return json(res, { error: "Pedido no encontrado" }, 404);
      return json(res, { order });
    } catch (e) {
      return json(res, { error: e.message }, 400);
    }
  }

  if (req.method === "DELETE") {
    return json(res, { error: "Los pedidos no se pueden eliminar" }, 405);
  }

  return json(res, { error: "Método no permitido" }, 405);
}
