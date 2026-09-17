import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { api, formatMxn } from "@/lib/store/client";

export default function Carrito() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [city, setCity] = useState("Ciudad de México");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    setName(user.name);
    api.cart().then((d) => {
      setCart(d.cart);
      setProducts(d.products);
    });
  }, [user, loading]);

  const rows = useMemo(() => {
    if (!cart) return [];
    return cart.items
      .map((i) => {
        const p = products.find((x) => x.id === i.productId);
        if (!p) return null;
        return { ...i, product: p };
      })
      .filter(Boolean);
  }, [cart, products]);

  const total = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);

  return (
    <>
      <Head>
        <title>Carrito — Oro Lozano</title>
      </Head>
      <PageShell>
        {loading ? (
          <p className="py-20 text-center text-muted">Cargando…</p>
        ) : !user ? (
          <div className="mx-auto max-w-lg px-5 py-20 text-center">
            <h1 className="text-3xl">Tu carrito te espera</h1>
            <p className="mt-3 text-muted">Inicia sesión como cliente para comprar.</p>
            <Link href="/cuenta" className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-8 text-xs tracking-[0.2em] uppercase text-bg">
              Entrar
            </Link>
          </div>
        ) : (
          <section className="mx-auto max-w-4xl px-5 py-12 md:px-8">
            <h1 className="text-4xl">Carrito</h1>
            {rows.length === 0 ? (
              <p className="mt-8 text-muted">
                Vacío. Explora la <Link href="/tienda" className="text-gold">colección</Link>.
              </p>
            ) : (
              <div className="mt-8 space-y-4">
                {rows.map((r) => (
                  <div key={r.productId} className="flex gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                    <img src={r.product.image} alt="" className="size-24 rounded-[var(--radius-md)] object-cover bg-elevated" />
                    <div className="flex-1">
                      <h2 className="font-display text-xl">{r.product.name}</h2>
                      <p className="text-sm tabular-nums text-muted">{formatMxn(r.product.price)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button type="button" className="size-10 rounded-full border border-border" onClick={() => api.updateCart(r.productId, r.quantity - 1).then((d) => setCart(d.cart))}>−</button>
                        <span className="tabular-nums">{r.quantity}</span>
                        <button type="button" className="size-10 rounded-full border border-border" onClick={() => api.updateCart(r.productId, r.quantity + 1).then((d) => setCart(d.cart))}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-[var(--radius-xl)] border border-border bg-elevated p-6">
                  <p className="text-lg tabular-nums">Total {formatMxn(total)}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre para envío" className="h-12 rounded-[var(--radius-md)] border border-border bg-bg px-4" />
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" className="h-12 rounded-[var(--radius-md)] border border-border bg-bg px-4" />
                  </div>
                  <button
                    type="button"
                    className="mt-5 h-12 w-full rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg"
                    onClick={async () => {
                      setMsg("");
                      try {
                        await api.checkout(name, city);
                        setCart({ userId: user.id, items: [], updatedAt: new Date().toISOString() });
                        router.push("/cuenta");
                      } catch (e) {
                        setMsg(e.message);
                      }
                    }}
                  >
                    Confirmar pedido
                  </button>
                  {msg ? <p className="mt-3 text-sm text-gold">{msg}</p> : null}
                </div>
              </div>
            )}
          </section>
        )}
      </PageShell>
    </>
  );
}
