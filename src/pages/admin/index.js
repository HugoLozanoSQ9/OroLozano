import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { api, formatMxn } from "@/lib/store/client";

export default function Admin() {
  const { user, token, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("piezas");
  const [form, setForm] = useState({
    name: "",
    category: "anillos",
    metal: "Oro amarillo",
    purity: "18k",
    description: "",
    weightGrams: "5",
    price: "1500000",
    image: "/products/anillo-sello.svg",
    density: "15.5",
    touchstone: "Prueba de toque positiva",
    ultrasound: "Metal macizo — respuesta uniforme",
    notes: "Pieza única sin piedras",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const [p, o] = await Promise.all([api.adminProducts(), api.adminOrders()]);
    setProducts(p.products);
    setOrders(o.orders);
  }

  useEffect(() => {
    if (user?.role === "admin" && token) load().catch((e) => setMsg(e.message));
  }, [user, token]);

  const isAdmin = user?.role === "admin" && token;

  return (
    <>
      <Head>
        <title>Atelier — Oro Lozano</title>
      </Head>
      <PageShell>
        {loading ? (
          <p className="py-20 text-center text-muted">Cargando…</p>
        ) : !isAdmin ? (
          <div className="px-5 py-20 text-center">
            <h1 className="text-3xl">Atelier reservado</h1>
            <p className="mt-3 text-muted">Entra con la cuenta de administrador.</p>
            <Link href="/cuenta" className="mt-6 inline-block text-gold">Ir a entrar</Link>
          </div>
        ) : (
          <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
            <p className="text-xs tracking-[0.28em] uppercase text-gold">Atelier</p>
            <h1 className="mt-2 text-4xl">Piezas únicas y certificados</h1>
            <p className="mt-2 text-sm text-muted">Stock fijo = 1. Oro/plata sin piedras. UUID + QR automáticos.</p>
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
              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
                <form
                  className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setMsg("");
                    try {
                      await api.adminCreateProduct({
                        name: form.name,
                        category: form.category,
                        metal: form.metal,
                        purity: form.purity,
                        description: form.description,
                        weightGrams: Number(form.weightGrams),
                        price: Number(form.price),
                        image: form.image,
                        certificate: {
                          density: Number(form.density),
                          densityMethod: "densímetro",
                          touchstone: form.touchstone,
                          ultrasound: form.ultrasound,
                          notes: form.notes,
                          tests: { touchstone: true, densimeter: true, ultrasound: true },
                        },
                      });
                      setMsg("Pieza creada con certificado UUID");
                      await load();
                    } catch (err) {
                      setMsg(err.message);
                    }
                  }}
                >
                  <h2 className="font-display text-2xl">Nueva pieza + certificado</h2>
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <select className="h-11 w-full rounded-md border border-border bg-bg px-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="anillos">Anillos</option>
                    <option value="collares">Collares</option>
                    <option value="aretes">Aretes</option>
                    <option value="pulseras">Pulseras</option>
                  </select>
                  <select className="h-11 w-full rounded-md border border-border bg-bg px-3" value={form.metal} onChange={(e) => setForm({ ...form, metal: e.target.value })}>
                    <option value="Oro amarillo">Oro amarillo</option>
                    <option value="Oro blanco">Oro blanco</option>
                    <option value="Oro rosa">Oro rosa</option>
                    <option value="Plata">Plata</option>
                  </select>
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="Pureza (18k / 14k / 925)" value={form.purity} onChange={(e) => setForm({ ...form, purity: e.target.value })} />
                  <textarea className="min-h-20 w-full rounded-md border border-border bg-bg px-3 py-2" placeholder="Descripción (sin piedras)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="Peso gramos" value={form.weightGrams} onChange={(e) => setForm({ ...form, weightGrams: e.target.value })} />
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="Precio centavos MXN" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="URL imagen" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="Densidad g/cm³" value={form.density} onChange={(e) => setForm({ ...form, density: e.target.value })} />
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="Resultado piedra de toque" value={form.touchstone} onChange={(e) => setForm({ ...form, touchstone: e.target.value })} />
                  <input className="h-11 w-full rounded-md border border-border bg-bg px-3" placeholder="Resultado ultrasonido" value={form.ultrasound} onChange={(e) => setForm({ ...form, ultrasound: e.target.value })} />
                  <textarea className="min-h-16 w-full rounded-md border border-border bg-bg px-3 py-2" placeholder="Notas del certificado" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  <button type="submit" className="h-11 w-full rounded-full bg-gold text-xs tracking-[0.18em] uppercase text-bg">
                    Guardar pieza única
                  </button>
                </form>
                <div className="space-y-3">
                  {products.map((p) => (
                    <div key={p.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                      <div className="flex gap-4">
                        <img src={p.image} alt="" className="size-20 rounded-md object-cover bg-elevated" />
                        <div className="flex-1">
                          <h3 className="font-display text-xl">{p.name}</h3>
                          <p className="text-sm tabular-nums text-muted">
                            {formatMxn(p.price)} · {p.weightGrams || "—"} g · stock {p.stock}
                          </p>
                          {p.certificate ? (
                            <p className="mt-1 text-xs text-gold">
                              {p.certificate.serial} ·{" "}
                              <Link href={`/certificado/${p.certificate.uuid}`} className="underline">
                                certificado
                              </Link>
                            </p>
                          ) : null}
                          <button
                            type="button"
                            className="mt-2 h-9 rounded-full border border-danger/40 px-3 text-xs text-danger"
                            onClick={async () => {
                              await api.adminDeleteProduct(p.id);
                              await load();
                            }}
                          >
                            Eliminar
                          </button>
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
                      <p className="text-sm text-muted">
                        {o.shippingName} · {o.shippingCity} · {o.status}
                      </p>
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
