import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { ProductGallery } from "@/components/ProductGallery";
import { getGuestCart, setGuestCart } from "@/lib/store/auth-client";
import { api, formatMxn } from "@/lib/store/client";

export default function Producto() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .product(id)
      .then((d) => setProduct(d.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function addToCart() {
    if (!product || product.stock < 1 || product.sold) return;
    setBusy(true);
    setMsg("");
    try {
      if (token && user && user.role !== "admin") {
        await api.addToCart(product.id, 1);
      } else if (!token || !user) {
        const cart = getGuestCart().filter((i) => i.productId !== product.id);
        cart.push({ productId: product.id, quantity: 1 });
        setGuestCart(cart);
      } else {
        setMsg("Usa una cuenta de cliente para comprar");
        setBusy(false);
        return;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ol-cart-change"));
      }
      setMsg("Añadido al carrito");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  const gallery = product
    ? [...(product.images || []), product.image]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
    : [];

  return (
    <>
      <Head>
        <title>{product ? `${product.name} — Oro Lozano` : "Pieza — Oro Lozano"}</title>
      </Head>
      <PageShell>
        {loading ? (
          <p className="py-20 text-center text-muted">Cargando…</p>
        ) : !product ? (
          <p className="py-20 text-center text-muted">Pieza no encontrada.</p>
        ) : (
          <section className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-2 md:px-8">
            <ProductGallery images={gallery} alt={product.name} />
            <div>
              <p className="text-xs tracking-[0.28em] uppercase text-gold">
                {product.category} · {product.metal} {product.purity || product.karat}
              </p>
              <h1 className="mt-3 text-4xl md:text-5xl">{product.name}</h1>
              <p className="mt-4 text-2xl tabular-nums text-gold-strong">{formatMxn(product.price)}</p>
              <p className="mt-2 text-sm text-gold">Pieza única · sin piedras · existencia 1</p>
              <p className="mt-6 leading-relaxed text-muted">{product.description}</p>
              <p className="mt-4 text-sm leading-relaxed text-subtle">{product.details}</p>
              {product.weightGrams ? (
                <p className="mt-3 text-sm text-muted">Peso: {product.weightGrams} g</p>
              ) : null}
              {product.certificate ? (
                <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm">
                  <p className="text-xs tracking-[0.16em] uppercase text-gold">Certificado</p>
                  <p className="mt-1">Serial {product.certificate.serial}</p>
                  <Link
                    href={`/certificado/${product.certificate.uuid}`}
                    className="mt-2 inline-block text-gold hover:underline"
                  >
                    Ver certificado y QR
                  </Link>
                </div>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={busy || product.stock < 1 || product.sold}
                  className="h-12 rounded-full bg-gold px-8 text-xs tracking-[0.2em] uppercase text-bg disabled:opacity-50"
                  onClick={addToCart}
                >
                  {product.stock < 1 || product.sold ? "No disponible" : "Añadir al carrito"}
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
