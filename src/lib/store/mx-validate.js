/** Validaciones y formatos México */

export const MX_STATES = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua",
  "Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero",
  "Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro",
  "Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz",
  "Yucatán","Zacatecas",
];

export const KARAT_OPTIONS = Array.from({ length: 24 }, (_, i) => `${i + 1}K`);

export function onlyDigits(value, maxLen) {
  const v = String(value || "").replace(/\D/g, "");
  return maxLen ? v.slice(0, maxLen) : v;
}

export function onlyLettersSpaces(value, maxLen = 80) {
  const v = String(value || "").replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.-]/g, "");
  return v.slice(0, maxLen);
}

export function onlyAlnumUser(value, maxLen = 24) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, maxLen);
}

export function validateEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (e.length > 80) return "Máximo 80 caracteres";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Correo inválido";
  return null;
}

export function validatePhoneMx(phone) {
  const d = onlyDigits(phone, 10);
  if (!d) return null; // opcional
  if (d.length !== 10) return "Teléfono a 10 dígitos (México)";
  return null;
}

export function validateZipMx(zip) {
  const d = onlyDigits(zip, 5);
  if (!d) return "C.P. requerido";
  if (d.length !== 5) return "C.P. debe ser 5 dígitos";
  return null;
}

export function formatMxnFromCentavos(cents) {
  const n = Number(cents || 0) / 100;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** pesos → centavos */
export function pesosToCentavos(pesos) {
  return Math.round(Number(pesos || 0) * 100);
}

/**
 * Precio de venta:
 * spot * peso → + margen% → + IVA%
 * retorna { centavos, pesos, breakdown }
 */
export function calculateSalePrice({ weightGrams, spotPerGram, marginPercent = 35, ivaPercent = 16 }) {
  const weight = Number(weightGrams) || 0;
  const spot = Number(spotPerGram) || 0;
  const margin = Number(marginPercent) || 0;
  const iva = Number(ivaPercent) || 0;
  const priceSpot = spot * weight;
  const withMargin = priceSpot * (1 + margin / 100);
  const withIva = withMargin * (1 + iva / 100);
  const pesos = Math.round(withIva * 100) / 100;
  return {
    pesos,
    centavos: Math.round(pesos * 100),
    breakdown: {
      weightGrams: weight,
      spotPerGram: spot,
      priceSpot: Math.round(priceSpot * 100) / 100,
      marginPercent: margin,
      withMargin: Math.round(withMargin * 100) / 100,
      ivaPercent: iva,
      withIva: pesos,
    },
  };
}
