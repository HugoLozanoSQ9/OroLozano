import { json } from "@/lib/store/http";
import { resetPasswordWithOtp } from "@/lib/store/services";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Método no permitido" }, 405);
  const email = (req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "").trim();
  const newPassword = req.body?.newPassword || req.body?.password || "";
  try {
    await resetPasswordWithOtp({ email, otp, newPassword });
    return json(res, { ok: true, message: "Contraseña actualizada. Ya puedes entrar." });
  } catch (err) {
    return json(res, { error: err.message || "No se pudo restablecer" }, 400);
  }
}
