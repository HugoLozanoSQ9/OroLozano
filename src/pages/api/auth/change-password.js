import { currentUserFromRequest, json } from "@/lib/store/http";
import { findUserById, updateUser, verifyPassword } from "@/lib/store/services";

/** Usuario logueado cambia contraseña (sin OTP de recuperación) */
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Método no permitido" }, 405);
  const user = await currentUserFromRequest(req);
  if (!user) return json(res, { error: "Inicia sesión" }, 401);

  const currentPassword = req.body?.currentPassword || "";
  const newPassword = req.body?.newPassword || "";
  if (!currentPassword || !newPassword) {
    return json(res, { error: "Indica contraseña actual y nueva" }, 400);
  }
  if (String(newPassword).length < 6) {
    return json(res, { error: "La nueva contraseña debe tener al menos 6 caracteres" }, 400);
  }
  if (String(newPassword).length > 64) {
    return json(res, { error: "Máximo 64 caracteres" }, 400);
  }

  const full = await findUserById(user.id);
  const ok = await verifyPassword(currentPassword, full.password);
  if (!ok) return json(res, { error: "Contraseña actual incorrecta" }, 401);

  await updateUser(user.id, { password: newPassword });
  return json(res, { ok: true, message: "Contraseña actualizada" });
}
