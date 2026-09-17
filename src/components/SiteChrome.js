import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { api } from "@/lib/store/client";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await api.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return { user, loading, refresh, logout };
}

export function SiteHeader({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-8">
        <Link href="/" className="flex items-center gap-3 text-gold">
          <BrandMark className="size-9 md:size-10" />
          <span className="font-display text-lg tracking-[0.22em] text-fg md:text-xl">
            ORO<span className="mx-1.5 text-gold">|</span>LOZANO
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs tracking-[0.22em] uppercase text-muted md:flex">
          <Link href="/tienda" className="hover:text-gold">
            Colección
          </Link>
          <Link href="/cuenta" className="hover:text-gold">
            {user ? "Mi cuenta" : "Entrar"}
          </Link>
          {user?.role === "admin" ? (
            <Link href="/admin" className="text-gold">
              Atelier
            </Link>
          ) : null}
          {user ? (
            <button
              type="button"
              className="hover:text-gold"
              onClick={async () => {
                await onLogout?.();
                router.push("/");
              }}
            >
              Salir
            </button>
          ) : null}
          <Link href="/carrito" className="text-fg">
            Carrito
          </Link>
        </nav>
        <button type="button" className="md:hidden text-fg" onClick={() => setOpen((v) => !v)}>
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>
      {open ? (
        <div className="flex flex-col gap-4 border-t border-border px-5 py-5 text-xs tracking-[0.2em] uppercase text-muted md:hidden">
          <Link href="/tienda" onClick={() => setOpen(false)}>
            Colección
          </Link>
          <Link href="/cuenta" onClick={() => setOpen(false)}>
            {user ? "Mi cuenta" : "Entrar"}
          </Link>
          {user?.role === "admin" ? (
            <Link href="/admin" onClick={() => setOpen(false)}>
              Atelier
            </Link>
          ) : null}
          <Link href="/carrito" onClick={() => setOpen(false)}>
            Carrito
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display tracking-[0.22em] text-gold">ORO | LOZANO</p>
          <p className="mt-2 text-sm text-muted">Joyería y oro premium.</p>
        </div>
        <p className="text-xs tracking-[0.16em] uppercase text-subtle">Atelier · Ciudad de México</p>
      </div>
    </footer>
  );
}

export function PageShell({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <SiteHeader user={user} onLogout={logout} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
