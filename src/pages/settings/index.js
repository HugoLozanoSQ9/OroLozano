import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { Toast } from "@/components/Toast";
import { KARAT_OPTIONS } from "@/lib/store/mx-validate";
import { api } from "@/lib/store/client";

export default function SettingsPage() {
  const { user, token, loading } = useAuth();
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [spot, setSpot] = useState({});
  const [margin, setMargin] = useState(35);
  const [iva, setIva] = useState(16);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  const isAdmin = user?.role === "admin" && token;

  const usedKarats = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (!p.active) return;
      const k = String(p.purity || p.karat || "").toUpperCase();
      if (k) set.add(k.endsWith("K") ? k : `${k}K`);
    });
    return Array.from(set).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [products]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const [s, p] = await Promise.all([api.adminSettings(), api.adminProducts()]);
        setSettings(s.settings);
        setCategories(s.settings.categories || []);
        setSpot(s.settings.goldSpotByKarat || {});
        setMargin(s.settings.marginPercent ?? 35);
        setIva(s.settings.ivaPercent ?? 16);
        setProducts(p.products || []);
      } catch (e) {
        setToastType("error");
        setToast(e.message);
      }
    })();
  }, [isAdmin]);

  async function save() {
    try {
      const { settings: next } = await api.adminUpdateSettings({
        categories,
        goldSpotByKarat: spot,
        marginPercent: Number(margin),
        ivaPercent: Number(iva),
      });
      setSettings(next);
      setToastType("success");
      setToast("Settings guardados");
    } catch (e) {
      setToastType("error");
      setToast(e.message);
    }
  }

  function addCategory() {
    const name = newCat.trim().slice(0, 40);
    if (!name) return;
    const id = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (categories.some((c) => c.id === id)) {
      setToastType("error");
      setToast("Esa categoría ya existe");
      return;
    }
    setCategories([...categories, { id, name, slug: id }]);
    setNewCat("");
  }

  return (
    <>
      <Head>
        <title>Settings — Oro Lozano</title>
      </Head>
      <PageShell>
        <Toast message={toast} type={toastType} onClose={() => setToast("")} />
        {loading ? (
          <p className="py-20 text-center text-muted">Cargando…</p>
        ) : !isAdmin ? (
          <div className="px-5 py-20 text-center">
            <h1 className="text-3xl">Solo administradores</h1>
            <Link href="/cuenta" className="mt-4 inline-block text-gold">
              Entrar
            </Link>
          </div>
        ) : (
          <section className="mx-auto max-w-3xl px-5 py-12 md:px-8">
            <p className="text-xs tracking-[0.28em] uppercase text-gold">Settings</p>
            <h1 className="mt-2 text-4xl">Configuración de venta</h1>
            <p className="mt-2 text-sm text-muted">
              Categorías, precio spot por kilataje, margen e IVA. El precio de cada pieza se calcula en el
              atelier.
            </p>

            <div className="mt-10 space-y-8">
              <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
                <h2 className="font-display text-2xl">Categorías</h2>
                <ul className="mt-4 space-y-2">
                  {categories.map((c) => (
                    <li key={c.id} className="flex items-center justify-between text-sm">
                      <span>
                        {c.name} <span className="text-subtle">({c.id})</span>
                      </span>
                      <button
                        type="button"
                        className="text-xs text-danger"
                        onClick={() => setCategories(categories.filter((x) => x.id !== c.id))}
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-2">
                  <input
                    className="h-11 flex-1 rounded-md border border-border bg-bg px-3"
                    placeholder="Nueva categoría"
                    maxLength={40}
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="h-11 rounded-full border border-border px-4 text-xs uppercase tracking-wide"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
                <h2 className="font-display text-2xl">Precio spot del oro (por g)</h2>
                <p className="mt-2 text-sm text-muted">
                  Solo se muestran kilatajes presentes en piezas activas del catálogo. Ejemplo: 14K = 1800 →
                  peso × 1800 × 1.35 × 1.16.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(usedKarats.length ? usedKarats : KARAT_OPTIONS.filter((k) => ["10K", "14K", "18K", "24K"].includes(k))).map(
                    (k) => (
                      <label key={k} className="block text-xs text-subtle">
                        Spot {k} (MXN / g)
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg tabular-nums"
                          inputMode="decimal"
                          value={spot[k] ?? ""}
                          onChange={(e) =>
                            setSpot({
                              ...spot,
                              [k]: e.target.value.replace(/[^\d.]/g, "").slice(0, 12),
                            })
                          }
                          placeholder="1800"
                        />
                      </label>
                    ),
                  )}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-subtle">
                    Margen ganancia %
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))}
                    />
                  </label>
                  <label className="block text-xs text-subtle">
                    IVA %
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3"
                      value={iva}
                      onChange={(e) => setIva(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={save}
                className="h-12 w-full rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg"
              >
                Guardar settings
              </button>
            </div>
          </section>
        )}
      </PageShell>
    </>
  );
}
