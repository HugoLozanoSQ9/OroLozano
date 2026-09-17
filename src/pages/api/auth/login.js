import { createSession, findUserByUsername, toPublic } from "@/lib/store/services";
import { json, setSessionCookie } from "@/lib/store/http";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Método no permitido" }, 405);
  const username = (req.body?.username || "").trim();
  const password = req.body?.password || "";
  const user = await findUserByUsername(username);
  if (!user || user.password !== password) {
    return json(res, { error: "Usuario o contraseña incorrectos" }, 401);
  }
  const session = await createSession(user.id);
  setSessionCookie(res, session.id);
  return json(res, { user: toPublic(user) });
}
