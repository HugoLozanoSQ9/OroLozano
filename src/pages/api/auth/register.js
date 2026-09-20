import { createSession, createUser, toPublic } from "@/lib/store/services";
import { json, setSessionCookie } from "@/lib/store/http";
import { signJwt } from "@/lib/store/jwt";

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
    const publicUser = toPublic(user);
    const token = signJwt({
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });
    return json(res, { user: publicUser, token }, 201);
  } catch (err) {
    return json(res, { error: err.message || "No se pudo registrar" }, 400);
  }
}
