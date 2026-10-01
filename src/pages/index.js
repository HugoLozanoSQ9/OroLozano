import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/SiteChrome";
import { api, formatMxn } from "@/lib/store/client";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .products()
      .then((d) => {
        const list = (d.products || []).filter((p) => p.active && !p.sold);
        const sorted = [
          ...list.filter((p) => p.featured),
          ...list.filter((p) => !p.featured),
        ].slice(0, 8);
        setFeatured(sorted);
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>Oro Lozano — Oro y plata premium</title>
        <meta
          name="description"
          content="Joyería en oro y plata. Piezas únicas sin piedras, con certificado de autenticidad."
        />
      </Head>
      <PageShell>
        <section className="relative overflow-hidden px-5 pb-20 pt-16 md:px-8 md:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,169,110,0.12),transparent_55%)]" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
            <BrandMark className="hero-fade mb-6 size-16 text-gold md:size-20" />
            <h1 className="hero-fade font-display text-4xl tracking-[0.12em] text-fg md:text-6xl">
              ORO<span className="mx-2 text-gold">|</span>LOZANO
            </h1>
            <p className="hero-fade-2 mt-3 text-xs tracking-[0.35em] uppercase text-gold">
              Oro y plata · piezas únicas
            </p>
            <p className="hero-fade-2 mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Vendemos solo oro y plata macizos, sin piedras. Cada joya es única, con certificado de
              autenticidad, serial y código QR.
            </p>
            <div className="hero-fade-3 mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/tienda"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-medium tracking-[0.2em] uppercase text-bg"
              >
                Ver colección
              </Link>
              <Link
                href="/guias"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-xs font-medium tracking-[0.2em] uppercase text-fg hover:border-gold/50"
              >
                Guías de cuidado
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-elevated/40 py-14">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <p className="text-xs tracking-[0.28em] uppercase text-gold">Inventario</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Piezas disponibles</h2>
            {loading ? (
              <p className="mt-10 text-center text-sm text-muted">Cargando piezas…</p>
            ) : featured.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted">
                Por el momento no hay piezas disponibles. Vuelve pronto.
              </p>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((p) => {
                  const cover = p.image || (p.images && p.images[0]) || "";
                  return (
                    <Link
                      key={p.id}
                      href={`/producto/${p.id}`}
                      className="group overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface transition hover:border-gold/50"
                    >
                      <div className="aspect-square overflow-hidden bg-elevated">
                        {cover ? (
                          <img
                            src={cover}
                            alt={p.name}
                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-subtle">—</div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-gold">
                          {p.purity || p.karat || p.metal || "Pieza única"}
                        </p>
                        <h3 className="mt-1 font-display text-lg leading-tight">{p.name}</h3>
                        <p className="mt-2 text-sm tabular-nums text-muted">{formatMxn(p.price)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="mt-8 text-center">
              <Link href="/tienda" className="text-xs tracking-[0.2em] uppercase text-gold hover:underline">
                Ver catálogo completo →
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16 text-center md:px-8">
          <p className="text-xs tracking-[0.28em] uppercase text-gold">Atelier</p>
          <h2 className="mt-3 font-display text-3xl">Una sola pieza. Un solo dueño.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Cada joya sale del catálogo al venderse. Certificado con UUID, serial y QR para garantizar
            autenticidad y pureza.
          </p>
        </section>
      </PageShell>
    </>
  );
}
