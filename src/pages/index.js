import Head from "next/head";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/SiteChrome";
import { formatMxn } from "@/lib/store/client";

const featured = [
  { id: "prd_solitario", name: "Anillo Aurora", price: 2890000, image: "/products/anillo-solitario.svg", tag: "Oro 18k" },
  { id: "prd_tennis", name: "Cadena Riviera", price: 5650000, image: "/products/collar-tennis.svg", tag: "Oro 18k" },
  { id: "prd_gota", name: "Aretes Lágrima", price: 1980000, image: "/products/aretes-gota.svg", tag: "Oro 18k" },
  { id: "prd_plata", name: "Brazalete Plata 925", price: 890000, image: "/products/brazalete-diamantes.svg", tag: "Plata 925" },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Oro Lozano — Oro y plata premium</title>
        <meta name="description" content="Joyería en oro y plata. Piezas únicas sin piedras, con certificado de autenticidad." />
      </Head>
      <PageShell>
        <section className="relative overflow-hidden px-5 pb-24 pt-16 md:px-8 md:pt-24">
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
              Vendemos solo oro y plata macizos, sin piedras. Cada joya es única,
              con certificado de autenticidad, serial y código QR.
            </p>
            <div className="hero-fade-3 mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/tienda" className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-medium tracking-[0.2em] uppercase text-bg">
                Ver colección
              </Link>
              <Link href="/guias" className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-xs tracking-[0.2em] uppercase text-fg hover:border-gold hover:text-gold">
                Guías de cuidado
              </Link>
            </div>
          </div>
        </section>

        <div className="gold-rule mx-auto max-w-5xl" />

        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <p className="text-xs tracking-[0.28em] uppercase text-gold">Selección</p>
          <h2 className="mt-2 text-3xl font-medium md:text-4xl">Piezas únicas disponibles</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Una sola existencia por diseño. Cuando se vende, esa pieza deja de existir en catálogo.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p.id} href={`/producto/${p.id}`} className="group overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
                <div className="aspect-square overflow-hidden bg-elevated">
                  <img src={p.image} alt={p.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="p-5">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-gold">{p.tag}</p>
                  <h3 className="mt-1 font-display text-xl">{p.name}</h3>
                  <p className="mt-2 text-sm tabular-nums text-muted">{formatMxn(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:px-8">
            <div>
              <p className="text-xs tracking-[0.28em] uppercase text-gold">Autenticidad</p>
              <h2 className="mt-3 text-3xl font-medium md:text-4xl">Certificado, UUID y QR por cada joya</h2>
              <p className="mt-5 leading-relaxed text-muted">
                Probamos cada pieza con piedra de toque, densímetro y ultrasonido.
                El certificado digital se consulta con el código QR del serial.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                ["Sin piedras de fábrica", "Oro y plata puros. Piedras solo sobre pedido."],
                ["Una existencia", "Cada diseño tiene una sola pieza disponible."],
                ["Trazabilidad", "Serial OL + UUID + QR vinculados al certificado."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-[var(--radius-lg)] border border-border bg-elevated p-5">
                  <h3 className="font-display text-xl text-gold-strong">{t}</h3>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageShell>
    </>
  );
}
