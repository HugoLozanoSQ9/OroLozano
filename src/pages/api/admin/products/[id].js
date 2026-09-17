import { currentUserFromRequest, json } from "@/lib/store/http";
import { deleteProduct, updateProduct } from "@/lib/store/services";

export default async function handler(req, res) {
  const user = await currentUserFromRequest(req);
  if (!user || user.role !== "admin") return json(res, { error: "No autorizado" }, 403);
  const { id } = req.query;

  if (req.method === "PUT") {
    const product = await updateProduct(id, req.body || {});
    if (!product) return json(res, { error: "No encontrado" }, 404);
    return json(res, { product });
  }

  if (req.method === "DELETE") {
    await deleteProduct(id);
    return json(res, { ok: true });
  }

  return json(res, { error: "Método no permitido" }, 405);
}
