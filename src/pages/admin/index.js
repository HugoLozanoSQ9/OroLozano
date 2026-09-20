import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CertificateBadge } from "@/components/CertificateBadge";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { ORDER_STATUSES, statusLabel } from "@/lib/store/order-status";
import { api, formatMxn } from "@/lib/store/client";

const emptyCertForm = {
  productId: "",
  weightGrams: "",
  density: "15.5",
  densityMethod: "densímetro",
  touchstone: "Prueba de toque positiva",
  ultrasound: "Metal macizo — respuesta uniforme",
  notes: "Pieza única sin piedras",
  serial: "",
};

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
  });
  const [certModal, setCertModal] = useState(null);
  const [certForm, setCertForm] = useState(emptyCertForm);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [p, o] = await Promise.all([api.adminProducts(), api.adminOrders()]);
    setProducts(p.products);
    setOrders(o.orders);
  }

  useEffect(() => {
    if (user?.role === "admin" && token) load().catch((e) => setMsg(e.message));
  }, [user, token]);

  const isAdmin = user?.role === "admin" && token;

  function openCert(product) {
    const c = product.certificate || {};
    setCertModal(product);
    setCertForm({
      productId: product.id,
      weightGrams: String(c.weightGrams ?? product.weightGrams ?? ""),
      density: String(c.density ?? "15.5"),
      densityMethod: c.densityMethod || "densímetro",
      touchstone: c.touchstone || "Prueba de toque positiva",
      ultrasound: c.ultrasound || "Metal macizo — respuesta uniforme",
      notes: c.notes || "Pieza única sin piedras",
      serial: c.serial || "",
    });
  }

  async function saveCertificate(e) {
    e.preventDefault();
    if (!certModal) return;
    setBusy(true);
    setMsg("");
    try {
      const existing = certModal.certificate || {};
      const certPayload = {
        serial: certForm.serial || existing.serial || "",
        weightGrams: Number(certForm.weightGrams) || 0,
        density: Number(certForm.density) || 0,
        densityMethod: certForm.densityMethod,
        touchstone: certForm.touchstone,
        ultrasound: certForm.ultrasound,
        notes: certForm.notes,
        tests: { touchstone: true, densimeter: true, ultrasound: true },
        issuedAt: existing.issuedAt || new Date().toISOString(),
        issuedBy: existing.issuedBy || "Oro Lozano Atelier",
      };
      if (existing.uuid) certPayload.uuid = existing.uuid;
      await api.adminUpdateProduct(certModal.id, {
        weightGrams: Number(certForm.weightGrams) || 0,
        certificate: certPayload,
      });
      setMsg("Certificado guardado");
      setCertModal(null);
      await load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

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
            <Link href="/cuenta" className="mt-6 inline-block text-gold">
              Ir a entrar
            </Link>
          </div>
        ) : (
          <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
            <p className="text-xs tracking-[0.28em] uppercase text-gold">Atelier</p>
            <h1 className="mt-2 text-4xl">Piezas, certificados y despacho</h1>
            <p className="mt-2 text-sm text-muted">
              Icono gris = sin certificado · dorado = certificado cargado. Pedidos eternos con estatus.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { id: "piezas", label: "Piezas" },
                { id: "pedidos", label: "Despachar pedidos" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`h-10 rounded-full border px-4 text-xs uppercase tracking-[0.16em] ${
                    tab === t.id ? "border-gold bg-gold text-bg" : "border-border text-muted"
                  }`}
                >
                  {t.label}
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
                      });
                      setMsg("Pieza creada (puedes cargar el certificado con el icono)");
                      setForm({ ...form, name: "", description: "" });
                      await load();
                    } catch (err) {
                      setMsg(err.message);
                    }
                  }}
                >
                  <h2 className="font-display text-2xl">Nueva pieza</h2>
                  <p className="text-xs text-muted">El certificado se carga después con el icono del escudo.</p>
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
                  <button type="submit" className="h-11 w-full rounded-full bg-gold text-xs tracking-[0.18em] uppercase text-bg">
                    Guardar pieza
                  </button>
                </form>

                <div className="space-y-3">
                  {products.map((p) => {
                    const hasCert = Boolean(p.certificate?.uuid);
                    return (
                      <div key={p.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                        <div className="flex gap-4">
                          <img src={p.image} alt="" className="size-20 rounded-md object-cover bg-elevated" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-display text-xl">{p.name}</h3>
                                <p className="text-sm tabular-nums text-muted">
                                  {formatMxn(p.price)} · {p.weightGrams || "—"} g · stock {p.stock}
                                </p>
                              </div>
                              <CertificateBadge hasCertificate={hasCert} onClick={() => openCert(p)} />
                            </div>
                            {hasCert ? (
                              <p className="mt-1 text-xs text-gold">
                                {p.certificate.serial} ·{" "}
                                <Link href={`/certificado/${p.certificate.uuid}`} className="underline">
                                  ver público
                                </Link>
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-subtle">Sin certificado — pulsa el escudo gris</p>
                            )}
                            <button
                              type="button"
                              className="mt-2 h-9 rounded-full border border-danger/40 px-3 text-xs text-danger"
                              onClick={async () => {
                                await api.adminDeleteProduct(p.id);
                                await load();
                              }}
                            >
                              Eliminar pieza
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <p className="text-sm text-muted">
                  Los pedidos no se eliminan. Solo avanzan de estatus hasta finalizado.
                </p>
                {orders.length === 0 ? (
                  <p className="text-muted">Sin pedidos todavía.</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-gold">{o.id}</p>
                          <p className="tabular-nums text-lg">{formatMxn(o.total)}</p>
                          <p className="mt-1 text-sm text-muted">
                            {o.shippingName} · {o.shippingCity}
                          </p>
                          <p className="mt-2 text-xs tracking-wide text-gold-strong">
                            {statusLabel(o.status || "recibido")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <select
                            className="h-10 min-w-[220px] rounded-md border border-border bg-bg px-3 text-xs"
                            value={o.status || "recibido"}
                            onChange={async (e) => {
                              setMsg("");
                              try {
                                await api.adminUpdateOrder(o.id, { status: e.target.value });
                                setMsg(`Estatus actualizado: ${statusLabel(e.target.value)}`);
                                await load();
                              } catch (err) {
                                setMsg(err.message);
                              }
                            }}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.step}. {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {o.items?.length ? (
                        <ul className="mt-3 space-y-1 text-sm text-muted">
                          {o.items.map((it, i) => (
                            <li key={i}>
                              {it.name} · {formatMxn(it.price)}
                              {it.serial ? ` · ${it.serial}` : ""}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {Array.isArray(o.statusHistory) && o.statusHistory.length > 0 ? (
                        <ol className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-subtle">
                          {o.statusHistory.map((h, i) => (
                            <li key={i}>
                              {new Date(h.at).toLocaleString("es-MX")} — {statusLabel(h.status)}
                              {h.note ? ` (${h.note})` : ""}
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Certificate modal */}
            {certModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <form
                  onSubmit={saveCertificate}
                  className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-bg p-6 shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs tracking-[0.2em] uppercase text-gold">Certificado</p>
                      <h3 className="font-display text-2xl">{certModal.name}</h3>
                    </div>
                    <button type="button" className="text-sm text-muted" onClick={() => setCertModal(null)}>
                      Cerrar
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <Field label="Peso (g)" value={certForm.weightGrams} onChange={(v) => setCertForm({ ...certForm, weightGrams: v })} />
                    <Field label="Densidad (g/cm³)" value={certForm.density} onChange={(v) => setCertForm({ ...certForm, density: v })} />
                    <Field label="Método densidad" value={certForm.densityMethod} onChange={(v) => setCertForm({ ...certForm, densityMethod: v })} />
                    <Field label="Piedra de toque" value={certForm.touchstone} onChange={(v) => setCertForm({ ...certForm, touchstone: v })} />
                    <Field label="Ultrasonido" value={certForm.ultrasound} onChange={(v) => setCertForm({ ...certForm, ultrasound: v })} />
                    <Field label="Serial (opcional)" value={certForm.serial} onChange={(v) => setCertForm({ ...certForm, serial: v })} />
                    <label className="block">
                      <span className="mb-1 block text-xs tracking-[0.16em] uppercase text-subtle">Notas</span>
                      <textarea
                        className="min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2"
                        value={certForm.notes}
                        onChange={(e) => setCertForm({ ...certForm, notes: e.target.value })}
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-5 h-11 w-full rounded-full bg-gold text-xs tracking-[0.18em] uppercase text-bg disabled:opacity-50"
                  >
                    {certModal.certificate?.uuid ? "Actualizar certificado" : "Cargar certificado"}
                  </button>
                </form>
              </div>
            ) : null}
          </section>
        )}
      </PageShell>
    </>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs tracking-[0.16em] uppercase text-subtle">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-border bg-surface px-3"
      />
    </label>
  );
}
