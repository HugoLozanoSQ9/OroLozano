export function WhatsAppButton({
  phone = "5215512345678",
  message = "Hola Oro Lozano, tengo una duda sobre una pieza.",
}) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Dudas y preguntas por WhatsApp"
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl md:bottom-8 md:left-8"
      title="Dudas y preguntas"
    >
      <svg viewBox="0 0 32 32" className="size-7 fill-current" aria-hidden>
        <path d="M16.1 3.2c-7 0-12.7 5.6-12.7 12.6 0 2.2.6 4.3 1.7 6.2L3.2 28.8l6.9-1.8c1.8 1 3.9 1.5 6 1.5 7 0 12.7-5.6 12.7-12.6S23.1 3.2 16.1 3.2zm0 23.1c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.1 1.1 1.1-4-.3-.4a10.4 10.4 0 01-1.6-5.6c0-5.8 4.7-10.5 10.6-10.5 5.8 0 10.5 4.7 10.5 10.5 0 5.9-4.7 10.5-10.5 10.5zm5.8-7.9c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6 0-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.9 1.2 2.9.8 3.4.8.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.4z" />
      </svg>
    </a>
  );
}
