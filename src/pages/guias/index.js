import Head from "next/head";
import { PageShell } from "@/components/SiteChrome";

const sections = [
  {
    title: "Cómo cuidar tu oro",
    items: [
      "Guarda cada pieza por separado en un sobre o estuche suave para evitar rayones entre metales.",
      "Evita contacto con cloro, sal marina, perfumes y limpiadores abrasivos.",
      "Limpieza en casa: agua tibia, jabón neutro y cepillo suave; seca con paño de microfibra.",
      "Una vez al año, pide pulido profesional en el atelier para recuperar el brillo.",
    ],
  },
  {
    title: "Cómo cuidar la plata 925",
    items: [
      "La plata se oxida de forma natural; es normal un ligero oscurecimiento con el tiempo.",
      "Usa un paño anti-oxidación o un baño específico para plata cuando pierda brillo.",
      "No uses pasta de dientes ni bicarbonato en exceso: pueden rayar el acabado satinado.",
      "Guárdala en bolsas cerradas con una tira anti-oxidación si no la usas seguido.",
    ],
  },
  {
    title: "Cómo verificar autenticidad",
    items: [
      "Toda pieza Oro Lozano incluye serial OL, UUID y código QR del certificado.",
      "Escanea el QR o visita /certificado/[uuid] para ver peso, densidad y pruebas de laboratorio de atelier.",
      "Realizamos prueba de toque, densímetro y ultrasonido en cada joya antes de publicarla.",
      "Desconfía de precios muy por debajo del valor del metal y de piezas sin trazabilidad.",
    ],
  },
  {
    title: "Sobre piedras y pedidos especiales",
    items: [
      "Nuestro catálogo estándar es 100% oro o plata, sin piedras engastadas.",
      "Si deseas una pieza con piedras, se cotiza y fabrica sobre pedido con contrato aparte.",
      "Así garantizamos pureza del metal y un certificado claro por cada pieza única.",
    ],
  },
];

export default function Guias() {
  return (
    <>
      <Head>
        <title>Guías — Oro Lozano</title>
      </Head>
      <PageShell>
        <section className="mx-auto max-w-3xl px-5 py-16 md:px-8">
          <p className="text-xs tracking-[0.28em] uppercase text-gold">Recomendaciones</p>
          <h1 className="mt-2 text-4xl">Cuidado y autenticidad</h1>
          <p className="mt-4 text-muted">
            Consejos prácticos para conservar el metal y verificar que tu joya sea genuina.
          </p>
          <div className="mt-12 space-y-10">
            {sections.map((s) => (
              <article key={s.title} className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
                <h2 className="font-display text-2xl text-gold-strong">{s.title}</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                  {s.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </PageShell>
    </>
  );
}
