import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { api, formatMxn } from "@/lib/store/client";

export default function Admin() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("piezas");
  const [form, setForm] = useState({
    name: "",
    category: "anillos",
    description: "",
    price: "1000000",
    stock: "1",
    image: "/products/anillo-sello.svg",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const [p, o] = await Promise.all([api.adminProducts(), api.adminOrders()]);
    setProducts(p.products);
    setOrders(o.orders);
  }

  useEffect(() => {
    if (user?.role === "admin") load().catch((e) => setMsg(e.message));
  }, [user]);

  return (
    <>
      <Head>
        <title>Atelier — Oro Lozano</title>
      </Head>
      <PageShell>
        {loading ? (
          <p className="py-20 text-center text-muted">Cargando…</p>
        ) : !user || user.role !== "admin" ? (
          <div className="px-5 py-20 text-center">
            <h1 className="text-3xl">Atelier reservado</h1>
            <p className="mt-3 text-muted">Entra con la cuenta de administrador.</p>
            <Link href="/cuenta" className="mt-6 inline-block text-gold">Ir a entrar</Link>
          </div>
        ) : (
          <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
            <p className="text-xs tracking-[0.28em] uppercase text-gold">Atelier</p>
            <h1 className="mt-2 text-4xl">Administrar piezas</h1>
            <div className="mt-6 flex gap-2">
              {["piezas", "pedidos"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`h-10 rounded-full border px-4 text-xs uppercase tracking-[0.16em] ${
                    tab === t ? "border-gold bg-gold text-bg" : "border-border text-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {msg ? <p className="mt-4 text-sm text-gold">{msg}</p> : null}

            {tab === "piezas" ? (
              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                <form
                  className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setMsg("");
                    try {
                      await api.adminCreateProduct({
                        ...form,
                        price: Number(form.price),
                        stock: Number(form.stock),
                      });
                      setMsg("Pieza creada");
                      await load();
                    } catch (err) {
                      setMsg(err.message);
                    }
                  }}
                >
                  <h2 className="font-display text-2xl">Nueva pieza</h2>
                  <input className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <select className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="anillos">Anillos</option>
                    <option value="collares">Collares</option>
                    <option value="aretes">Aretes</option>
                    <option value="pulseras">Pulseras</option>
                  </select>
                  <textarea className="min-h-20 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2" placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <input className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3" placeholder="Precio en centavos MXN" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  <input className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  <input className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3" placeholder="Ruta de imagen" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  <button type="submit" className="h-11 w-full rounded-full bg-gold text-xs tracking-[0.18em] uppercase text-bg">Guardar pieza</button>
                </form>
                <div className="space-y-3">
                  {products.map((p) => (
                    <div key={p.id} className="flex gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                      <img src={p.image} alt="" className="size-20 rounded-[var(--radius-sm)] object-cover bg-elevated" />
                      <div className="flex-1">
                        <h3 className="font-display text-xl">{p.name}</h3>
                        <p className="text-sm tabular-nums text-muted">{formatMxn(p.price)} · stock {p.stock}</p>
                        <div className="mt-2 flex gap-2">
                          <button type="button" className="h-9 rounded-full border border-border px-3 text-xs" onClick={async () => { await api.adminUpdateProduct(p.id, { stock: p.stock + 1 }); await load(); }}>+ stock</button>
                          <button type="button" className="h-9 rounded-full border border-danger/40 px-3 text-xs text-danger" onClick={async () => { await api.adminDeleteProduct(p.id); await load(); }}>Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {orders.length === 0 ? (
                  <p className="text-muted">Sin pedidos todavía.</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="rounded-[var(--radius-lg)] border border-border p-4">
                      <p className="text-gold">{o.id}</p>
                      <p className="tabular-nums">{formatMxn(o.total)}</p>
                      <p className="text-sm text-muted">{o.shippingName} · {o.status} · {o.items.length} piezas</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}
      </PageShell>
    </>
  );
}
