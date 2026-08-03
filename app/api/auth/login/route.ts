import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { crearSesionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

// Login "manual" de la etapa demo:
// - admin: usuario/contraseña definidos por variables de entorno
// - profesional: usuario/contraseña cargados a mano en la tabla profesionales
export async function POST(req: NextRequest) {
  const { usuario, password } = await req.json();
  if (!usuario || !password) {
    return NextResponse.json({ error: "Usuario y contraseña son obligatorios" }, { status: 400 });
  }

  // 1) Intento como admin
  const adminUser = process.env.ADMIN_USUARIO || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "clave2026";
  if (usuario === adminUser && password === adminPass) {
    const token = crearSesionToken({ tipo: "admin", nombre: "Administración" });
    const res = NextResponse.json({ ok: true, tipo: "admin" });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  }

  // 2) Intento como profesional
  const supabase = supabaseServer();
  const { data: prof, error } = await supabase
    .from("profesionales")
    .select("id, nombre, usuario, password, activo")
    .eq("usuario", usuario)
    .single();

  if (error || !prof || !prof.activo || prof.password !== password) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const token = crearSesionToken({
    tipo: "profesional",
    profesionalId: prof.id,
    nombre: prof.nombre,
  });
  const res = NextResponse.json({ ok: true, tipo: "profesional" });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
