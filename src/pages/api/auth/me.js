import { currentUserFromRequest, json } from "@/lib/store/http";
import { toPublic } from "@/lib/store/services";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, { error: "Método no permitido" }, 405);
  const user = await currentUserFromRequest(req);
  return json(res, { user: user ? toPublic(user) : null });
}
