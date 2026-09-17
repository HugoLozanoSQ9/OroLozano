import { findUserById, getSession } from "./services";

export const SESSION_COOKIE = "ol_session";

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const i = p.indexOf("=");
        if (i === -1) return [p, ""];
        return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
      }),
  );
}

export function getSessionId(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[SESSION_COOKIE] || null;
}

export async function currentUserFromRequest(req) {
  const id = getSessionId(req);
  if (!id) return null;
  const session = await getSession(id);
  if (!session) return null;
  const user = await findUserById(session.userId);
  return user ?? null;
}

export function json(res, data, status = 200) {
  res.status(status).json(data);
}

export function setSessionCookie(res, sessionId) {
  const maxAge = 60 * 60 * 24 * 14;
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}
