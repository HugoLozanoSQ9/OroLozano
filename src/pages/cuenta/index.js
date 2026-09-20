import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { setSession } from "@/lib/store/auth-client";
import { statusLabel } from "@/lib/store/order-status";
import { api, formatMxn } from "@/lib/store/client";

const emptyShipping = {
  fullName: "",
  phone: "",
  street: "",
  extNumber: "",
  intNumber: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
  references: "",
  betweenStreets: "",
};

const MX_STATES = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua",
  "Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero",
  "Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro",
  "Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz",
  "Yucatán","Zacatecas",
];

export default function Cuenta() {
  const { user, token, loading, refresh, setAuth } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [shipping, setShipping] = useState(emptyShipping);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!user) return;
    setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    setShipping({ ...emptyShipping, ...(user.shipping || {}), fullName: user.shipping?.fullName || user.name || "" });
    if (user.role !== "admin") {
      api.orders().then((d) => setOrders(d.orders)).catch(() => {});
    }
  }, [user]);

  return (
    <>
      <Head>
        <title>Cuenta — Oro Lozano</title>
      </Head>
      <PageShell>
        {loading ? (
          <p className="py-20 text-center text-muted">Cargando…</p>
        ) : user && token ? (
          user.role === "admin" ? (
            <section className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8">
              <p className="text-xs tracking-[0.28em] uppercase text-gold">Administrador</p>
              <h1 className="mt-2 text-4xl">{user.name}</h1>
              <p className="mt-2 text-muted">@{user.username}</p>
              <p className="mx-auto mt-6 max-w-md text-sm text-muted">
                La cuenta de atelier no gestiona datos de envío personales.
                Usa el panel para piezas, certificados y despacho de pedidos.
              </p>
              <Link
                href="/admin"
                className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-8 text-xs tracking-[0.18em] uppercase text-bg"
              >
                Ir al atelier
              </Link>
            </section>
          ) : (
            <section className="mx-auto max-w-3xl px-5 py-12 md:px-8">
              <p className="text-xs tracking-[0.28em] uppercase text-gold">Cliente</p>
              <h1 className="mt-2 text-4xl">{user.name}</h1>
              <p className="mt-2 text-muted">@{user.username} · {user.email}</p>

              <form
                className="mt-12 space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaved("");
                  setError("");
                  try {
                    const { user: updated } = await api.updateProfile({
                      name: profile.name,
                      email: profile.email,
                      phone: profile.phone,
                      shipping,
                    });
                    setSession(token, updated);
                    setAuth(token, updated);
                    setSaved("Datos guardados");
                    await refresh();
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                <h2 className="font-display text-2xl">Datos personales</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Nombre completo" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                  <Field label="Correo" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
                  <Field label="Teléfono" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                </div>

                <h2 className="pt-4 font-display text-2xl">Dirección de envío (México)</h2>
                <p className="text-sm text-muted">Datos para paquetería nacional.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Nombre quien recibe" value={shipping.fullName} onChange={(v) => setShipping({ ...shipping, fullName: v })} />
                  <Field label="Teléfono de contacto" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} />
                  <Field label="Calle" value={shipping.street} onChange={(v) => setShipping({ ...shipping, street: v })} />
                  <Field label="No. exterior" value={shipping.extNumber} onChange={(v) => setShipping({ ...shipping, extNumber: v })} />
                  <Field label="No. interior" value={shipping.intNumber} onChange={(v) => setShipping({ ...shipping, intNumber: v })} />
                  <Field label="Colonia" value={shipping.neighborhood} onChange={(v) => setShipping({ ...shipping, neighborhood: v })} />
                  <Field label="Ciudad / Municipio" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                  <label className="block">
                    <span className="mb-1 block text-xs tracking-[0.16em] uppercase text-subtle">Estado</span>
                    <select
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="h-12 w-full rounded-[var(--radius-md)] border border-border bg-bg px-4"
                    >
                      <option value="">Selecciona</option>
                      {MX_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="C.P." value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} />
                  <Field label="Entre calles" value={shipping.betweenStreets} onChange={(v) => setShipping({ ...shipping, betweenStreets: v })} />
                  <div className="md:col-span-2">
                    <Field label="Referencias" value={shipping.references} onChange={(v) => setShipping({ ...shipping, references: v })} />
                  </div>
                </div>
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                {saved ? <p className="text-sm text-gold">{saved}</p> : null}
                <button type="submit" className="h-12 rounded-full bg-gold px-8 text-xs tracking-[0.2em] uppercase text-bg">
                  Guardar cambios
                </button>
              </form>

              <h2 className="mt-12 font-display text-2xl">Mis pedidos</h2>
              <p className="mt-1 text-sm text-muted">Historial permanente — no se eliminan.</p>
              <div className="mt-4 space-y-3">
                {orders.length === 0 ? (
                  <p className="text-muted">Aún no hay pedidos.</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="rounded-[var(--radius-lg)] border border-border p-4">
                      <p className="text-sm text-gold">{o.id}</p>
                      <p className="tabular-nums">{formatMxn(o.total)}</p>
                      <p className="mt-1 text-sm text-gold-strong">{statusLabel(o.status || "recibido")}</p>
                      <p className="text-sm text-muted">
                        {o.shippingName || o.shipping?.fullName} · {o.shippingCity || o.shipping?.city}
                      </p>
                      {Array.isArray(o.statusHistory) && o.statusHistory.length > 1 ? (
                        <ol className="mt-3 space-y-1 text-xs text-subtle">
                          {o.statusHistory.map((h, i) => (
                            <li key={i}>
                              {new Date(h.at).toLocaleString("es-MX")} — {statusLabel(h.status)}
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>
          )
        ) : (
          <section className="mx-auto max-w-md px-5 py-16">
            <h1 className="text-center text-4xl">{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
            <p className="mt-3 text-center text-sm text-muted">Cliente: juan / uwu · Admin: hugo / 1</p>
            <form
              className="mt-8 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  if (mode === "login") {
                    const data = await api.login(username, password);
                    setAuth(data.token, data.user);
                  } else {
                    const data = await api.register({ username, password, name, email });
                    setAuth(data.token, data.user);
                  }
                  await refresh();
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              {mode === "register" ? (
                <>
                  <Field label="Nombre" value={name} onChange={setName} />
                  <Field label="Correo" value={email} onChange={setEmail} />
                </>
              ) : null}
              <Field label="Usuario" value={username} onChange={setUsername} />
              <Field label="Contraseña" value={password} onChange={setPassword} type="password" />
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <button type="submit" className="h-12 w-full rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg">
                {mode === "login" ? "Entrar" : "Registrarme"}
              </button>
            </form>
            <button
              type="button"
              className="mt-6 w-full text-sm text-muted hover:text-gold"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "¿Nuevo? Crea tu cuenta de cliente" : "Ya tengo cuenta"}
            </button>
          </section>
        )}
      </PageShell>
    </>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs tracking-[0.16em] uppercase text-subtle">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-[var(--radius-md)] border border-border bg-bg px-4"
      />
    </label>
  );
}
