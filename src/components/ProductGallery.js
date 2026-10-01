import { useState } from "react";

/** Carrusel de fotos de UNA pieza */
export function ProductGallery({ images = [], alt = "", className = "" }) {
  const list = (images || []).filter(Boolean);
  const [idx, setIdx] = useState(0);
  const current = list[idx] || list[0] || "";

  if (!list.length) {
    return (
      <div className={`flex aspect-square items-center justify-center rounded-[var(--radius-xl)] border border-border bg-elevated text-subtle ${className}`}>
        Sin imagen
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] border border-border bg-elevated">
        <img src={current} alt={alt} className="size-full object-cover" />
        {list.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Anterior"
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/80 text-gold backdrop-blur hover:border-gold"
              onClick={() => setIdx((i) => (i - 1 + list.length) % list.length)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/80 text-gold backdrop-blur hover:border-gold"
              onClick={() => setIdx((i) => (i + 1) % list.length)}
            >
              ›
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Foto ${i + 1}`}
                  className={`h-1.5 rounded-full transition ${i === idx ? "w-5 bg-gold" : "w-1.5 bg-border"}`}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {list.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`size-14 shrink-0 overflow-hidden rounded-md border ${
                i === idx ? "border-gold" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
