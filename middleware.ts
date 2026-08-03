import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ec_session";

// El middleware de Next.js corre en el "Edge runtime", que NO soporta el
// módulo "crypto" de Node. Por eso acá usamos la Web Crypto API
// (globalThis.crypto.subtle), que es el equivalente compatible con Edge.
async function firmarHmac(payload: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(firma))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sesionValida(req: NextRequest): Promise<{ tipo: string } | null> {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [payload, firma] = raw.split(".");
  if (!payload || !firma) return null;
  const secret = process.env.SESSION_SECRET || "dev-secret-cambiar";
  const firmaEsperada = await firmarHmac(payload, secret);
  if (firmaEsperada !== firma) return null;
  try {
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sesion = await sesionValida(req);

  if (pathname.startsWith("/admin")) {
    if (!sesion || sesion.tipo !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/profesional")) {
    if (!sesion || sesion.tipo !== "profesional") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profesional/:path*"],
};
