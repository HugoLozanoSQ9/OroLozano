import { json } from "@/lib/store/http";
import { listProducts } from "@/lib/store/services";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, { error: "Método no permitido" }, 405);
  const products = await listProducts();
  return json(res, { products });
}
