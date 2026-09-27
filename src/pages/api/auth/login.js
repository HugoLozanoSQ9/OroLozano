import { createSession, findUserByUsername, toPublic, verifyPassword } from "@/lib/store/services";
import { json, setSessionCookie } from "@/lib/store/http";
import { signJwt } from "@/lib/store/jwt";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Método no permitido" }, 405);
  const username = (req.body?.username || "").trim();
  const password = req.body?.password || "";
  const user = await findUserByUsername(username);
  if (!user) {
    return json(res, { error: "Usuario o contraseña incorrectos" }, 401);
  }
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return json(res, { error: "Usuario o contraseña incorrectos" }, 401);
  }
  const session = await createSession(user.id);
  setSessionCookie(res, session.id);
  const publicUser = toPublic(user);
  const token = signJwt({
    sub: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });
  return json(res, { user: publicUser, token });
}
