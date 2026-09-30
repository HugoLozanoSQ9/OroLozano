export const ORDER_STATUSES = [
  { id: "recibido", label: "Pedido recibido por la tienda", step: 1 },
  { id: "confirmado", label: "Pedido confirmado por la tienda", step: 2 },
  { id: "en_envio", label: "Pedido en proceso de envío", step: 3 },
  { id: "enviado", label: "Pedido enviado", step: 4 },
  { id: "finalizado", label: "Pedido finalizado", step: 5 },
  { id: "cancelado", label: "Pedido cancelado", step: 0 },
];

export function statusLabel(id) {
  return ORDER_STATUSES.find((s) => s.id === id)?.label || id || "Pedido recibido por la tienda";
}

/** Estatus a los que se puede avanzar. Cancelado es terminal. */
export function nextStatuses(current) {
  if (current === "cancelado") return [{ id: "cancelado", label: "Pedido cancelado", step: 0 }];
  const progressive = ORDER_STATUSES.filter((s) => s.id !== "cancelado");
  const idx = progressive.findIndex((s) => s.id === current);
  if (idx < 0) return ORDER_STATUSES;
  return [...progressive.slice(idx), ORDER_STATUSES.find((s) => s.id === "cancelado")];
}

export function isOrderLocked(status) {
  return status === "cancelado" || status === "finalizado";
}

export function canEditShipping(status) {
  return status === "recibido" || status === "confirmado";
}
