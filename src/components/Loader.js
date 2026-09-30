export function Loader({ label = "Cargando…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border border-border" />
        <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-gold" />
      </div>
      <p className="text-xs tracking-[0.28em] uppercase text-gold">{label}</p>
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <span className="inline-block size-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />
  );
}
