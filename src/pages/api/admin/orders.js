import { currentUserFromRequest, json } from "@/lib/store/http";
import { listOrders } from "@/lib/store/services";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, { error: "Método no permitido" }, 405);
  const user = await currentUserFromRequest(req);
  if (!user || user.role !== "admin") return json(res, { error: "No autorizado" }, 403);
  const orders = await listOrders();
  return json(res, { orders });
}
