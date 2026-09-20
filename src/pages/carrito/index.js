import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { clearGuestCart, getGuestCart, setGuestCart } from "@/lib/store/auth-client";
import { api, formatMxn } from "@/lib/store/client";

export default function Carrito() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    street: "",
    extNumber: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
    references: "",
  });

  useEffect(() => {
    async function load() {
      const { products: catalog } = await api.products();
      setProducts(catalog);
      if (token && user) {
        const { cart } = await api.cart();
        setItems(cart.items || []);
        if (user.shipping) {
          setShipping((s) => ({
            ...s,
            fullName: user.shipping.fullName || user.name || "",
            phone: user.shipping.phone || user.phone || "",
            street: user.shipping.street || "",
            extNumber: user.shipping.extNumber || "",
            neighborhood: user.shipping.neighborhood || "",
            city: user.shipping.city || "",
            state: user.shipping.state || "",
            zip: user.shipping.zip || "",
            references: user.shipping.references || "",
          }));
        }
      } else {
        setItems(getGuestCart());
      }
    }
    if (!loading) load().catch((e) => setMsg(e.message));
  }, [user, token, loading]);

  const rows = useMemo(
    () =>
      items
        .map((i) => {
          const p = products.find((x) => x.id === i.productId);
          return p ? { ...i, product: p } : null;
        })
        .filter(Boolean),
    [items, products],
  );
  const total = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);

  return (
    <>
      <Head>
        <title>Carrito — Oro Lozano</title>
      </Head>
      <PageShell>
        <section className="mx-auto max-w-4xl px-5 py-12 md:px-8">
          <h1 className="text-4xl">Carrito</h1>
          <p className="mt-2 text-sm text-muted">
            {token && user ? "Carrito de tu cuenta" : "Vista previa pública (invitado) — inicia sesión para comprar"}
          </p>
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
                    <p className="mt-1 text-xs text-subtle">Pieza única · cantidad fija 1</p>
                    <button
                      type="button"
                      className="mt-3 text-xs text-danger"
                      onClick={async () => {
                        if (token && user) {
                          const { cart } = await api.updateCart(r.productId, 0);
                          setItems(cart.items);
                        } else {
                          const next = getGuestCart().filter((i) => i.productId !== r.productId);
                          setGuestCart(next);
                          setItems(next);
                        }
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
              <div className="rounded-[var(--radius-xl)] border border-border bg-elevated p-6">
                <p className="text-lg tabular-nums">Total {formatMxn(total)}</p>
                {!token || !user ? (
                  <Link href="/cuenta" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg">
                    Entrar para comprar
                  </Link>
                ) : (
                  <>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {["fullName","phone","street","extNumber","neighborhood","city","state","zip"].map((k) => (
                        <input
                          key={k}
                          value={shipping[k] || ""}
                          onChange={(e) => setShipping({ ...shipping, [k]: e.target.value })}
                          placeholder={k}
                          className="h-12 rounded-[var(--radius-md)] border border-border bg-bg px-4 text-sm"
                        />
                      ))}
                      <input
                        value={shipping.references}
                        onChange={(e) => setShipping({ ...shipping, references: e.target.value })}
                        placeholder="Referencias"
                        className="h-12 rounded-[var(--radius-md)] border border-border bg-bg px-4 text-sm md:col-span-2"
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-5 h-12 w-full rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg"
                      onClick={async () => {
                        setMsg("");
                        try {
                          await api.checkout({
                            shippingName: shipping.fullName,
                            shippingCity: shipping.city,
                            shipping,
                          });
                          clearGuestCart();
                          setItems([]);
                          router.push("/cuenta");
                        } catch (e) {
                          setMsg(e.message);
                        }
                      }}
                    >
                      Confirmar pedido
                    </button>
                  </>
                )}
                {msg ? <p className="mt-3 text-sm text-gold">{msg}</p> : null}
              </div>
            </div>
          )}
        </section>
      </PageShell>
    </>
  );
}
