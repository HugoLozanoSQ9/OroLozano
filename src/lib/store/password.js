import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(String(plain), ROUNDS);
}

export async function verifyPassword(plain, hashed) {
  if (!hashed) return false;
  // Compat: si quedó algún password legacy en texto plano durante migración
  if (!String(hashed).startsWith("$2")) {
    return String(plain) === String(hashed);
  }
  return bcrypt.compare(String(plain), String(hashed));
}

export function generateOtp(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}
