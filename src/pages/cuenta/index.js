import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { api, formatMxn } from "@/lib/store/client";

export default function Cuenta() {
  const { user, loading, refresh } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.orders().then((d) => setOrders(d.orders)).catch(() => {});
  }, [user]);

  return (
    <>
      <Head>
        <title>Cuenta — Oro Lozano</title>
      </Head>
      <PageShell>
        {loading ? (
          <p className="py-20 text-center text-muted">Cargando…</p>
        ) : user ? (
          <section className="mx-auto max-w-3xl px-5 py-12 md:px-8">
            <p className="text-xs tracking-[0.28em] uppercase text-gold">
              {user.role === "admin" ? "Administrador" : "Cliente"}
            </p>
            <h1 className="mt-2 text-4xl">{user.name}</h1>
            <p className="mt-2 text-muted">@{user.username} · {user.email}</p>
            {user.role === "admin" ? (
              <Link href="/admin" className="mt-6 inline-flex h-11 items-center rounded-full bg-gold px-6 text-xs tracking-[0.18em] uppercase text-bg">
                Ir al atelier
              </Link>
            ) : null}
            <h2 className="mt-12 font-display text-2xl">Pedidos</h2>
            <div className="mt-4 space-y-3">
              {orders.length === 0 ? (
                <p className="text-muted">Aún no hay pedidos.</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="rounded-[var(--radius-lg)] border border-border p-4">
                    <p className="text-sm text-gold">{o.id}</p>
                    <p className="tabular-nums">{formatMxn(o.total)} · {o.status}</p>
                    <p className="text-sm text-muted">{o.shippingName} · {o.shippingCity}</p>
                  </div>
                ))
              )}
            </div>
          </section>
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
                  if (mode === "login") await api.login(username, password);
                  else await api.register({ username, password, name, email });
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
        className="h-12 w-full rounded-[var(--radius-md)] border border-border bg-surface px-4"
        required
      />
    </label>
  );
}
