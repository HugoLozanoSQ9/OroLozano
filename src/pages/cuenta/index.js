import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { Toast } from "@/components/Toast";
import { Loader, ButtonSpinner } from "@/components/Loader";
import { setSession } from "@/lib/store/auth-client";
import { statusLabel } from "@/lib/store/order-status";
import {
  onlyAlnumUser,
  onlyDigits,
  onlyLettersSpaces,
  validateEmail,
} from "@/lib/store/mx-validate";
import { api, formatMxn } from "@/lib/store/client";

export default function Cuenta() {
  const { user, token, loading, refresh, setAuth } = useAuth();
  const [mode, setMode] = useState("login");
  const [tab, setTab] = useState("pedidos"); // pedidos | perfil | password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoverEmail, setRecoverEmail] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [currentPassword, setCurrentPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    if (user.role !== "admin") {
      setOrdersLoading(true);
      api
        .orders()
        .then((d) => setOrders(d.orders || []))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  function showToast(msg, type = "success") {
    setToastType(type);
    setToast(msg);
  }

  return (
    <>
      <Head>
        <title>Cuenta — Oro Lozano</title>
      </Head>
      <PageShell>
        <Toast message={toast} type={toastType} onClose={() => setToast("")} />
        {loading ? (
          <Loader label="Cargando cuenta…" />
        ) : user && token ? (
          user.role === "admin" ? (
            <section className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8">
              <p className="text-xs tracking-[0.28em] uppercase text-gold">Administrador</p>
              <h1 className="mt-2 text-4xl">{user.name}</h1>
              <p className="mt-2 text-muted">@{user.username}</p>
              <Link
                href="/admin"
                className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-8 text-xs tracking-[0.18em] uppercase text-bg"
              >
                Ir al atelier
              </Link>
            </section>
          ) : (
            <section className="mx-auto max-w-3xl px-5 py-10 md:px-8">
              <p className="text-xs tracking-[0.28em] uppercase text-gold">Cliente</p>
              <h1 className="mt-2 text-4xl">{user.name}</h1>
              <p className="mt-2 text-muted">@{user.username} · {user.email}</p>

              {/* Mini menú superior */}
              <nav className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4">
                {[
                  { id: "pedidos", label: "Mis pedidos" },
                  { id: "perfil", label: "Datos personales" },
                  { id: "password", label: "Contraseña" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`h-10 rounded-full px-4 text-xs uppercase tracking-[0.16em] ${
                      tab === t.id ? "bg-gold text-bg" : "border border-border text-muted hover:text-gold"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>

              {tab === "pedidos" && (
                <div className="mt-8">
                  <p className="text-sm text-muted">
                    Historial permanente. Los datos de envío se capturan al confirmar el pedido, no aquí.
                  </p>
                  {ordersLoading ? (
                    <Loader label="Cargando pedidos…" />
                  ) : (
                    <div className="mt-4 space-y-3">
                      {orders.length === 0 ? (
                        <p className="text-muted">Aún no hay pedidos.</p>
                      ) : (
                        orders.map((o) => (
                          <div key={o.id} className="rounded-[var(--radius-lg)] border border-border p-4">
                            <p className="text-sm text-gold">{o.id}</p>
                            <p className="tabular-nums">{formatMxn(o.total)}</p>
                            <p
                              className={`mt-1 text-sm ${
                                o.status === "cancelado" ? "text-danger" : "text-gold-strong"
                              }`}
                            >
                              {statusLabel(o.status || "recibido")}
                            </p>
                            {(o.shippingName || o.shipping?.fullName) && (
                              <p className="text-sm text-muted">
                                Envío: {o.shippingName || o.shipping?.fullName} ·{" "}
                                {o.shippingCity || o.shipping?.city}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {tab === "perfil" && (
                <form
                  className="mt-8 space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const e1 = validateEmail(profile.email);
                    if (e1) {
                      showToast(e1, "error");
                      return;
                    }
                    setBusy(true);
                    try {
                      const { user: updated } = await api.updateProfile({
                        name: onlyLettersSpaces(profile.name, 80),
                        email: profile.email.trim().toLowerCase().slice(0, 80),
                        phone: onlyDigits(profile.phone, 10),
                      });
                      setSession(token, updated);
                      setAuth(token, updated);
                      showToast("Datos guardados");
                      await refresh();
                    } catch (err) {
                      showToast(err.message, "error");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <h2 className="font-display text-2xl">Datos personales</h2>
                  <p className="text-sm text-muted">
                    La dirección de envío se solicita solo al confirmar un pedido (pagos con envío).
                  </p>
                  <Field label="Nombre completo" value={profile.name} onChange={(v) => setProfile({ ...profile, name: onlyLettersSpaces(v, 80) })} maxLength={80} />
                  <Field label="Correo" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v.slice(0, 80) })} maxLength={80} />
                  <Field label="Teléfono (10 dígitos)" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: onlyDigits(v, 10) })} maxLength={10} inputMode="numeric" />
                  <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-8 text-xs tracking-[0.2em] uppercase text-bg disabled:opacity-50">
                    {busy ? <ButtonSpinner /> : null}
                    Guardar cambios
                  </button>
                </form>
              )}

              {tab === "password" && (
                <form
                  className="mt-8 space-y-3 rounded-[var(--radius-xl)] border border-border bg-surface p-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (changeNewPassword !== confirmPassword) {
                      showToast("Las contraseñas no coinciden", "error");
                      return;
                    }
                    setBusy(true);
                    try {
                      const res = await api.changePassword({
                        currentPassword,
                        newPassword: changeNewPassword,
                      });
                      showToast(res.message || "Contraseña actualizada");
                      setCurrentPassword("");
                      setChangeNewPassword("");
                      setConfirmPassword("");
                    } catch (err) {
                      showToast(err.message, "error");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <h2 className="font-display text-2xl">Cambiar contraseña</h2>
                  <Field label="Contraseña actual" value={currentPassword} onChange={setCurrentPassword} type="password" />
                  <Field label="Nueva (mín. 6)" value={changeNewPassword} onChange={setChangeNewPassword} type="password" />
                  <Field label="Confirmar nueva" value={confirmPassword} onChange={setConfirmPassword} type="password" />
                  <button type="submit" disabled={busy} className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-8 text-xs tracking-[0.18em] uppercase text-bg disabled:opacity-50">
                    {busy ? <ButtonSpinner /> : null}
                    Actualizar contraseña
                  </button>
                </form>
              )}
            </section>
          )
        ) : (
          <section className="mx-auto max-w-md px-5 py-16">
            <h1 className="text-center text-4xl">
              {mode === "login" && "Entrar"}
              {mode === "register" && "Crear cuenta"}
              {mode === "forgot" && "Recuperar acceso"}
              {mode === "reset" && "Nueva contraseña"}
            </h1>
            <p className="mt-3 text-center text-sm text-muted">
              {mode === "login" || mode === "register"
                ? "Cliente: juan / uwu · Admin: hugo / 1"
                : "Código OTP al correo registrado"}
            </p>

            {(mode === "login" || mode === "register") && (
              <form
                className="mt-8 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  setBusy(true);
                  try {
                    if (mode === "login") {
                      const data = await api.login(username, password);
                      setAuth(data.token, data.user);
                    } else {
                      if (validateEmail(email)) throw new Error(validateEmail(email));
                      const data = await api.register({
                        username: onlyAlnumUser(username),
                        password,
                        name: onlyLettersSpaces(name, 80),
                        email: email.trim().toLowerCase(),
                      });
                      setAuth(data.token, data.user);
                    }
                    await refresh();
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {mode === "register" ? (
                  <>
                    <Field label="Nombre" value={name} onChange={(v) => setName(onlyLettersSpaces(v, 80))} maxLength={80} />
                    <Field label="Correo" value={email} onChange={setEmail} maxLength={80} />
                  </>
                ) : null}
                <Field label="Usuario" value={username} onChange={(v) => setUsername(onlyAlnumUser(v))} maxLength={24} />
                <Field label="Contraseña" value={password} onChange={setPassword} type="password" />
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button type="submit" disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg disabled:opacity-50">
                  {busy ? <ButtonSpinner /> : null}
                  {mode === "login" ? "Entrar" : "Registrarme"}
                </button>
              </form>
            )}

            {mode === "forgot" && (
              <form
                className="mt-8 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    const res = await api.forgotPassword(recoverEmail);
                    showToast(res.message || "Revisa tu correo");
                    setMode("reset");
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Field label="Correo registrado" value={recoverEmail} onChange={setRecoverEmail} />
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg">
                  Enviar código OTP
                </button>
              </form>
            )}

            {mode === "reset" && (
              <form
                className="mt-8 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    const res = await api.resetPassword({ email: recoverEmail, otp, newPassword });
                    showToast(res.message || "Contraseña actualizada");
                    setMode("login");
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Field label="Correo" value={recoverEmail} onChange={setRecoverEmail} />
                <Field label="Código OTP" value={otp} onChange={setOtp} />
                <Field label="Nueva contraseña" value={newPassword} onChange={setNewPassword} type="password" />
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg">
                  Guardar nueva contraseña
                </button>
              </form>
            )}

            <div className="mt-6 space-y-2 text-center text-sm text-muted">
              {(mode === "login" || mode === "register") && (
                <>
                  <button type="button" className="block w-full hover:text-gold" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                    {mode === "login" ? "¿Nuevo? Crea tu cuenta" : "Ya tengo cuenta"}
                  </button>
                  <button type="button" className="block w-full hover:text-gold" onClick={() => setMode("forgot")}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </>
              )}
              {(mode === "forgot" || mode === "reset") && (
                <button type="button" className="block w-full hover:text-gold" onClick={() => setMode("login")}>
                  Volver a entrar
                </button>
              )}
            </div>
          </section>
        )}
      </PageShell>
    </>
  );
}

function Field({ label, value, onChange, type = "text", maxLength, inputMode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs tracking-[0.16em] uppercase text-subtle">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-[var(--radius-md)] border border-border bg-bg px-4"
      />
    </label>
  );
}
