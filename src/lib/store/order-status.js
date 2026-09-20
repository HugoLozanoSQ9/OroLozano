export const ORDER_STATUSES = [
  { id: "recibido", label: "Pedido recibido por la tienda", step: 1 },
  { id: "confirmado", label: "Pedido confirmado por la tienda", step: 2 },
  { id: "en_envio", label: "Pedido en proceso de envío", step: 3 },
  { id: "enviado", label: "Pedido enviado", step: 4 },
  { id: "finalizado", label: "Pedido finalizado", step: 5 },
];

export function statusLabel(id) {
  return ORDER_STATUSES.find((s) => s.id === id)?.label || id || "Pedido recibido por la tienda";
}

export function nextStatuses(current) {
  const idx = ORDER_STATUSES.findIndex((s) => s.id === current);
  if (idx < 0) return ORDER_STATUSES;
  return ORDER_STATUSES.slice(idx);
}
