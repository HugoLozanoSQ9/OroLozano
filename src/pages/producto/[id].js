import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { api, formatMxn } from "@/lib/store/client";

export default function Producto() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.product(id).then((d) => setProduct(d.product)).catch(() => setProduct(null));
  }, [id]);

  return (
    <>
      <Head>
        <title>{product ? `${product.name} — Oro Lozano` : "Pieza — Oro Lozano"}</title>
      </Head>
      <PageShell>
        {!product ? (
          <p className="px-5 py-20 text-center text-muted">Cargando pieza…</p>
        ) : (
          <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2 md:px-8">
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-elevated">
              <img src={product.image} alt={product.name} className="size-full object-cover" />
            </div>
            <div>
              <p className="text-xs tracking-[0.28em] uppercase text-gold">
                {product.category} · {product.metal} {product.karat}
              </p>
              <h1 className="mt-3 text-4xl md:text-5xl">{product.name}</h1>
              <p className="mt-4 text-2xl tabular-nums text-gold-strong">{formatMxn(product.price)}</p>
              <p className="mt-6 leading-relaxed text-muted">{product.description}</p>
              <p className="mt-4 text-sm leading-relaxed text-subtle">{product.details}</p>
              <p className="mt-4 text-sm text-muted">Disponibles: {product.stock}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={busy}
                  className="h-12 rounded-full bg-gold px-8 text-xs tracking-[0.2em] uppercase text-bg disabled:opacity-50"
                  onClick={async () => {
                    if (!user) {
                      router.push("/cuenta");
                      return;
                    }
                    setBusy(true);
                    setMsg("");
                    try {
                      await api.addToCart(product.id, 1);
                      setMsg("Añadido al carrito");
                    } catch (e) {
                      setMsg(e.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {user ? "Añadir al carrito" : "Entrar para comprar"}
                </button>
                <Link
                  href="/carrito"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-xs tracking-[0.2em] uppercase"
                >
                  Ver carrito
                </Link>
              </div>
              {msg ? <p className="mt-4 text-sm text-gold">{msg}</p> : null}
            </div>
          </section>
        )}
      </PageShell>
    </>
  );
}
