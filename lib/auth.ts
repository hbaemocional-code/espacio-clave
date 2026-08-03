import { cookies } from "next/headers";
import crypto from "crypto";
import type { Sesion } from "./types";

export const SESSION_COOKIE_NAME = "ec_session";

function secret() {
  return process.env.SESSION_SECRET || "dev-secret-cambiar";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

// Cookie simple firmada: base64(json) + "." + hmac
// No es OAuth ni JWT: es intencionalmente simple para la etapa demo,
// donde el login es usuario/contraseña guardados a mano en la tabla
// "profesionales" (mas adelante se migra a Supabase Auth).
export function crearSesionToken(sesion: Sesion) {
  const payload = Buffer.from(JSON.stringify(sesion)).toString("base64");
  const firma = sign(payload);
  return `${payload}.${firma}`;
}

export function leerSesion(): Sesion | null {
  const raw = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  const [payload, firma] = raw.split(".");
  if (!payload || !firma) return null;
  if (sign(payload) !== firma) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}
