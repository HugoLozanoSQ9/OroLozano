import { useEffect } from "react";

export function Toast({ message, type = "success", onClose, ms = 3200 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), ms);
    return () => clearTimeout(t);
  }, [message, ms, onClose]);

  if (!message) return null;

  const colors =
    type === "error"
      ? "border-danger/40 bg-danger/10 text-danger"
      : "border-gold/40 bg-gold/10 text-gold-strong";

  return (
    <div className="fixed top-20 right-5 z-[60] max-w-sm animate-[fadeIn_0.2s_ease]">
      <div className={`rounded-[var(--radius-lg)] border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${colors}`}>
        {message}
      </div>
    </div>
  );
}
