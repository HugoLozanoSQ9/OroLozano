import { currentUserFromRequest, json } from "@/lib/store/http";
import { updateOrderStatus } from "@/lib/store/services";
import { ORDER_STATUSES } from "@/lib/store/order-status";

const ALLOWED = new Set(ORDER_STATUSES.map((s) => s.id));

export default async function handler(req, res) {
  const user = await currentUserFromRequest(req);
  if (!user || user.role !== "admin") return json(res, { error: "No autorizado" }, 403);
  const { id } = req.query;

  if (req.method === "PATCH" || req.method === "PUT") {
    const status = req.body?.status;
    const note = req.body?.note || "";
    if (!status || !ALLOWED.has(status)) {
      return json(res, { error: "Estatus inválido" }, 400);
    }
    const order = await updateOrderStatus(id, status, note);
    if (!order) return json(res, { error: "Pedido no encontrado" }, 404);
    return json(res, { order });
  }

  // No DELETE — pedidos eternos
  if (req.method === "DELETE") {
    return json(res, { error: "Los pedidos no se pueden eliminar" }, 405);
  }

  return json(res, { error: "Método no permitido" }, 405);
}
