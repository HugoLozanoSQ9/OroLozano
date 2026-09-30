import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { PageShell, useAuth } from "@/components/SiteChrome";
import { Loader, ButtonSpinner } from "@/components/Loader";
import { Toast } from "@/components/Toast";
import { clearGuestCart, getGuestCart, setGuestCart } from "@/lib/store/auth-client";
import {
  MX_STATES,
  onlyDigits,
  onlyLettersSpaces,
  validatePhoneMx,
  validateZipMx,
} from "@/lib/store/mx-validate";
import { api, formatMxn } from "@/lib/store/client";

const emptyShip = {
  fullName: "",
  phone: "",
  street: "",
  extNumber: "",
  intNumber: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
  references: "",
  betweenStreets: "",
};

export default function Carrito() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [shipping, setShipping] = useState(emptyShip);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [busy, setBusy] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingCart(true);
      try {
        const { products: catalog } = await api.products();
        setProducts(catalog);
        if (token && user) {
          const { cart } = await api.cart();
          setItems(cart.items || []);
          if (user.name) {
            setShipping((s) => ({
              ...s,
              fullName: s.fullName || user.name || "",
              phone: s.phone || user.phone || "",
            }));
          }
        } else {
          setItems(getGuestCart());
        }
      } catch (e) {
        setToastType("error");
        setToast(e.message);
      } finally {
        setLoadingCart(false);
      }
    }
    if (!loading) load();
  }, [user, token, loading]);

  const rows = useMemo(
    () =>
      items
        .map((i) => {
          const p = products.find((x) => x.id === i.productId);
          return p ? { ...i, product: p } : null;
        })
        .filter(Boolean),
    [items, products],
  );
  const total = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);

  async function checkout() {
    const phoneErr = validatePhoneMx(shipping.phone);
    const zipErr = validateZipMx(shipping.zip);
    if (!shipping.fullName || !shipping.street || !shipping.city || !shipping.state) {
      setToastType("error");
      setToast("Completa los datos de envío requeridos");
      return;
    }
    if (phoneErr || zipErr) {
      setToastType("error");
      setToast(phoneErr || zipErr);
      return;
    }
    setBusy(true);
    try {
      const { order } = await api.checkout({
        shippingName: shipping.fullName,
        shippingCity: shipping.city,
        shipping,
      });
      clearGuestCart();
      setItems([]);
      router.push(`/pedido/exito?id=${order.id}`);
    } catch (e) {
      setToastType("error");
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Carrito — Oro Lozano</title>
      </Head>
      <PageShell>
        <Toast message={toast} type={toastType} onClose={() => setToast("")} />
        <section className="mx-auto max-w-4xl px-5 py-12 md:px-8">
          <h1 className="text-4xl">Carrito</h1>
          {loading || loadingCart ? (
            <Loader label="Cargando carrito…" />
          ) : rows.length === 0 ? (
            <p className="mt-8 text-muted">
              Vacío. Explora la{" "}
              <Link href="/tienda" className="text-gold">
                colección
              </Link>
              .
            </p>
          ) : (
            <div className="mt-8 space-y-4">
              {rows.map((r) => (
                <div key={r.productId} className="flex gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                  <img src={r.product.image} alt="" className="size-24 rounded-[var(--radius-md)] object-cover bg-elevated" />
                  <div className="flex-1">
                    <h2 className="font-display text-xl">{r.product.name}</h2>
                    <p className="text-sm tabular-nums text-muted">{formatMxn(r.product.price)}</p>
                    <p className="mt-1 text-xs text-subtle">Pieza única</p>
                    <button
                      type="button"
                      className="mt-3 text-xs text-danger"
                      onClick={async () => {
                        if (token && user) {
                          const { cart } = await api.updateCart(r.productId, 0);
                          setItems(cart.items);
                        } else {
                          const next = getGuestCart().filter((i) => i.productId !== r.productId);
                          setGuestCart(next);
                          setItems(next);
                        }
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}

              <div className="rounded-[var(--radius-xl)] border border-border bg-elevated p-6">
                <p className="text-lg tabular-nums">Total {formatMxn(total)}</p>
                {!token || !user ? (
                  <Link
                    href="/cuenta"
                    className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg"
                  >
                    Entrar para comprar
                  </Link>
                ) : (
                  <>
                    <h3 className="mt-6 font-display text-xl">Datos de envío</h3>
                    <p className="mt-1 text-sm text-muted">
                      Solo se piden al confirmar el pedido (envíos en territorio nacional).
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <ShipField label="Nombre quien recibe" value={shipping.fullName} onChange={(v) => setShipping({ ...shipping, fullName: onlyLettersSpaces(v, 80) })} />
                      <ShipField label="Teléfono 10 dígitos" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: onlyDigits(v, 10) })} />
                      <ShipField label="Calle" value={shipping.street} onChange={(v) => setShipping({ ...shipping, street: v.slice(0, 80) })} />
                      <ShipField label="No. exterior" value={shipping.extNumber} onChange={(v) => setShipping({ ...shipping, extNumber: v.slice(0, 10) })} />
                      <ShipField label="No. interior" value={shipping.intNumber} onChange={(v) => setShipping({ ...shipping, intNumber: v.slice(0, 10) })} />
                      <ShipField label="Colonia" value={shipping.neighborhood} onChange={(v) => setShipping({ ...shipping, neighborhood: v.slice(0, 60) })} />
                      <ShipField label="Ciudad" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: onlyLettersSpaces(v, 60) })} />
                      <label className="block">
                        <span className="mb-1 block text-xs uppercase tracking-wide text-subtle">Estado</span>
                        <select
                          className="h-12 w-full rounded-md border border-border bg-bg px-3"
                          value={shipping.state}
                          onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                        >
                          <option value="">Selecciona</option>
                          {MX_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                      <ShipField label="C.P. (5 dígitos)" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: onlyDigits(v, 5) })} />
                      <ShipField label="Entre calles" value={shipping.betweenStreets} onChange={(v) => setShipping({ ...shipping, betweenStreets: v.slice(0, 80) })} />
                      <div className="md:col-span-2">
                        <ShipField label="Referencias" value={shipping.references} onChange={(v) => setShipping({ ...shipping, references: v.slice(0, 120) })} />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={checkout}
                      className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-xs tracking-[0.2em] uppercase text-bg disabled:opacity-50"
                    >
                      {busy ? <ButtonSpinner /> : null}
                      Confirmar pedido
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </PageShell>
    </>
  );
}

function ShipField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-subtle">{label}</span>
      <input
        className="h-12 w-full rounded-md border border-border bg-bg px-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
