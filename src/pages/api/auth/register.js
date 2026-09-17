import { createSession, createUser, toPublic } from "@/lib/store/services";
import { json, setSessionCookie } from "@/lib/store/http";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Método no permitido" }, 405);
  const { username, password, name, email } = req.body || {};
  if (!username || !password || !name || !email) {
    return json(res, { error: "Completa todos los campos" }, 400);
  }
  try {
    const user = await createUser({
      username,
      password,
      name,
      email,
      role: "customer",
    });
    const session = await createSession(user.id);
    setSessionCookie(res, session.id);
    return json(res, { user: toPublic(user) }, 201);
  } catch (err) {
    return json(res, { error: err.message || "No se pudo registrar" }, 400);
  }
}
