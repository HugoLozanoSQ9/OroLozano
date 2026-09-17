import { deleteSession } from "@/lib/store/services";
import { clearSessionCookie, getSessionId, json } from "@/lib/store/http";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Método no permitido" }, 405);
  const id = getSessionId(req);
  if (id) await deleteSession(id);
  clearSessionCookie(res);
  return json(res, { ok: true });
}
