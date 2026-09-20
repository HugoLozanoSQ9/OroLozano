import { currentUserFromRequest, json } from "@/lib/store/http";
import { toPublic, updateUser } from "@/lib/store/services";

export default async function handler(req, res) {
  if (req.method !== "PUT") return json(res, { error: "Método no permitido" }, 405);
  const user = await currentUserFromRequest(req);
  if (!user) return json(res, { error: "Inicia sesión" }, 401);
  const body = req.body || {};
  const patch = {};
  if (body.name) patch.name = String(body.name).trim();
  if (body.email) patch.email = String(body.email).trim().toLowerCase();
  if (body.phone !== undefined) patch.phone = String(body.phone).trim();
  if (body.shipping && typeof body.shipping === "object") {
    patch.shipping = body.shipping;
  }
  const updated = await updateUser(user.id, patch);
  return json(res, { user: toPublic(updated) });
}
