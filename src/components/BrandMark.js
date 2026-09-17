export function BrandMark({ className = "size-10" }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <path d="M60 8 L112 60 L60 112 L8 60 Z" stroke="currentColor" strokeWidth="3.2" />
      <path d="M60 22 L98 60 L60 98 L22 60 Z" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <path
        d="M60 28 C44 40 38 52 38 66 C38 80 48 90 60 90 C72 90 82 80 82 66 C82 52 76 40 60 28 Z"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path d="M48 52 L72 52 L72 84 L60 96 L48 84 Z" stroke="currentColor" strokeWidth="2.2" />
      <path d="M48 52 L60 36 L72 52" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
