import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/SiteChrome";
import { api } from "@/lib/store/client";

export default function CertificadoPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!uuid) return;
    api
      .certificate(uuid)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [uuid]);

  const certUrl =
    typeof window !== "undefined" && uuid
      ? `${window.location.origin}/certificado/${uuid}`
      : "";
  const qrSrc = certUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=0b0b0b&color=c9a96e&data=${encodeURIComponent(certUrl)}`
    : "";

  return (
    <>
      <Head>
        <title>Certificado — Oro Lozano</title>
      </Head>
      <PageShell>
        <section className="mx-auto max-w-3xl px-5 py-16 md:px-8">
          {err ? <p className="text-danger">{err}</p> : null}
          {!data && !err ? <p className="text-muted">Cargando certificado…</p> : null}
          {data ? (
            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 md:p-10">
              <p className="text-xs tracking-[0.28em] uppercase text-gold">Certificado de autenticidad</p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">{data.product.name}</h1>
              <p className="mt-2 text-muted">
                {data.product.metal} · {data.product.purity} · {data.product.weightGrams} g
              </p>
              <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
                <div className="space-y-3 text-sm">
                  <Row label="Serial" value={data.certificate.serial} />
                  <Row label="UUID" value={data.certificate.uuid} mono />
                  <Row label="Densidad" value={`${data.certificate.density} g/cm³ (${data.certificate.densityMethod})`} />
                  <Row label="Piedra de toque" value={data.certificate.touchstone} />
                  <Row label="Ultrasonido" value={data.certificate.ultrasound} />
                  <Row label="Emitido" value={new Date(data.certificate.issuedAt).toLocaleString("es-MX")} />
                  <Row label="Emitido por" value={data.certificate.issuedBy} />
                  <p className="pt-2 text-muted">{data.certificate.notes}</p>
                </div>
                {qrSrc ? (
                  <div className="mx-auto text-center">
                    <img src={qrSrc} alt="Código QR del certificado" className="rounded-lg border border-border" />
                    <p className="mt-2 text-[11px] tracking-wide text-subtle">Escanea para verificar</p>
                  </div>
                ) : null}
              </div>
              <Link href={`/producto/${data.product.id}`} className="mt-8 inline-flex text-sm text-gold hover:underline">
                Ver pieza en tienda
              </Link>
            </div>
          ) : null}
        </section>
      </PageShell>
    </>
  );
}

function Row({ label, value, mono }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.16em] uppercase text-subtle">{label}</p>
      <p className={mono ? "break-all font-mono text-xs text-fg" : "text-fg"}>{value}</p>
    </div>
  );
}
