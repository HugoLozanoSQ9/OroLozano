import { json } from "@/lib/store/http";
import { requestPasswordReset } from "@/lib/store/services";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, { error: "Método no permitido" }, 405);
  const email = (req.body?.email || "").trim().toLowerCase();
  if (!email) return json(res, { error: "Indica tu correo" }, 400);
  try {
    await requestPasswordReset(email);
    // Siempre la misma respuesta (no filtrar existencia del correo)
    return json(res, {
      ok: true,
      message: "Si el correo está registrado, enviamos un código OTP. Revisa tu bandeja (o la consola del servidor en modo pruebas).",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return json(res, { error: err.message || "No se pudo procesar" }, 500);
  }
}
