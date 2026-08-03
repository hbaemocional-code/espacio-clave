import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { leerSesion } from "@/lib/auth";

export async function GET() {
  const sesion = leerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("profesionales")
    .select(
      "id, nombre, disciplina_id, consultorio_fijo_id, modalidad_facturacion, porcentaje_profesional, precio_consulta, valor_modulo_consultorio, valor_bloque_consultorio, activo, usuario"
    )
    .order("nombre");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profesionales: data });
}

export async function POST(req: NextRequest) {
  const sesion = leerSesion();
  if (!sesion || sesion.tipo !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    nombre,
    disciplina_id,
    consultorio_fijo_id,
    modalidad_facturacion,
    porcentaje_profesional,
    precio_consulta,
    valor_modulo_consultorio,
    valor_bloque_consultorio,
    usuario,
    password,
  } = body;

  if (!nombre || !disciplina_id || !usuario || !password) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("profesionales")
    .insert({
      nombre,
      disciplina_id,
      consultorio_fijo_id: consultorio_fijo_id || null,
      modalidad_facturacion: modalidad_facturacion || "porcentaje",
      porcentaje_profesional: porcentaje_profesional ?? 60,
      precio_consulta: precio_consulta ?? 0,
      valor_modulo_consultorio: valor_modulo_consultorio ?? 0,
      valor_bloque_consultorio: valor_bloque_consultorio ?? 0,
      usuario,
      password,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profesional: data }, { status: 201 });
}
