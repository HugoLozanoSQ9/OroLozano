export function CertificateBadge({ hasCertificate, onClick, title }) {
  const active = Boolean(hasCertificate);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || (active ? "Ver / editar certificado" : "Cargar certificado")}
      className={`inline-flex size-9 items-center justify-center rounded-full border transition ${
        active
          ? "border-gold/50 bg-gold/15 text-gold hover:bg-gold/25"
          : "border-border bg-elevated text-subtle hover:border-muted hover:text-muted"
      }`}
      aria-label={active ? "Certificado cargado" : "Sin certificado"}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
        {active ? <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
    </button>
  );
}
