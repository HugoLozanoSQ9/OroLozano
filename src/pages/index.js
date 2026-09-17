import Head from "next/head";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/SiteChrome";
import { formatMxn } from "@/lib/store/client";

const featured = [
  { id: "prd_solitario", name: "Solitario Aurora", price: 12890000, image: "/products/anillo-solitario.svg", tag: "Anillos" },
  { id: "prd_tennis", name: "Collar Riviera", price: 18650000, image: "/products/collar-tennis.svg", tag: "Collares" },
  { id: "prd_gota", name: "Aretes Lágrima", price: 6240000, image: "/products/aretes-gota.svg", tag: "Aretes" },
  { id: "prd_brazalete", name: "Brazalete Línea", price: 11240000, image: "/products/brazalete-diamantes.svg", tag: "Pulseras" },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Oro Lozano — Joyería y oro premium</title>
        <meta name="description" content="Joyería fina en oro 18k y diamantes. Piezas de autor." />
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
              Joyería & oro premium
            </p>
            <p className="hero-fade-2 mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Oro 18k y diamantes trabajados a mano. Piezas que se heredan, no que se sustituyen.
            </p>
            <div className="hero-fade-3 mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/tienda"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-medium tracking-[0.2em] uppercase text-bg active:scale-[0.96]"
              >
                Ver colección
              </Link>
              <Link
                href="/cuenta"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-xs tracking-[0.2em] uppercase text-fg hover:border-gold hover:text-gold"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </section>

        <div className="gold-rule mx-auto max-w-5xl" />

        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <div className="mb-10">
            <p className="text-xs tracking-[0.28em] uppercase text-gold">Selección</p>
            <h2 className="mt-2 text-3xl font-medium md:text-4xl">Piezas destacadas</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/producto/${p.id}`}
                className="group overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface"
              >
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
              <p className="text-xs tracking-[0.28em] uppercase text-gold">La casa</p>
              <h2 className="mt-3 text-3xl font-medium md:text-4xl">
                Orfebrería clásica, silueta contemporánea.
              </h2>
              <p className="mt-5 leading-relaxed text-muted">
                Cada pieza nace en el taller: oro certificado, diamantes seleccionados y un
                pulido que solo da el tiempo.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                ["Oro 18k", "Trazabilidad y pureza verificada."],
                ["Hecho a mano", "Maestros joyeros, una pieza a la vez."],
                ["Servicio de por vida", "Ajustes, pulido y recertificación."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-[var(--radius-lg)] border border-border bg-elevated p-5">
                  <h3 className="font-display text-xl text-gold-strong">{t}</h3>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
          <BrandMark className="mx-auto mb-6 size-14 text-gold" />
          <h2 className="text-3xl font-medium md:text-4xl">Únete a la casa</h2>
          <p className="mt-4 text-muted">
            Crea tu cuenta de cliente para reservar piezas y seguir pedidos.
          </p>
          <Link
            href="/cuenta"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-8 text-xs tracking-[0.2em] uppercase text-bg"
          >
            Registrarme
          </Link>
        </section>
      </PageShell>
    </>
  );
}
