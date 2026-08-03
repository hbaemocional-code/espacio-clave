import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { leerSesion } from "@/lib/auth";

// PATCH /api/profesionales/:id — admin edita cualquier campo, incluida la
// parte contable (porcentaje_profesional, precio_consulta) y el estado activo.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = leerSesion();
  if (!sesion || sesion.tipo !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const cambios: Record<string, unknown> = {};

  // Solo tomamos los campos que vinieron en el body, para no pisar
  // sin querer algo que el formulario no mandó (ej: password vacío).
  const camposPermitidos = [
    "nombre",
    "disciplina_id",
    "consultorio_fijo_id",
    "modalidad_facturacion",
    "porcentaje_profesional",
    "precio_consulta",
    "valor_modulo_consultorio",
    "valor_bloque_consultorio",
    "usuario",
    "activo",
  ];
  for (const campo of camposPermitidos) {
    if (campo in body) cambios[campo] = body[campo];
  }
  if (body.password) cambios.password = body.password; // solo si mandaron una nueva

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ error: "No hay cambios para guardar" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("profesionales")
    .update(cambios)
    .eq("id", params.id)
    .select(
      "id, nombre, disciplina_id, consultorio_fijo_id, modalidad_facturacion, porcentaje_profesional, precio_consulta, valor_modulo_consultorio, valor_bloque_consultorio, activo, usuario"
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ese usuario ya está en uso por otro profesional." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profesional: data });
}

// DELETE /api/profesionales/:id — solo si no tiene turnos cargados
// (si tiene historial, se recomienda desactivar en vez de borrar).
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = leerSesion();
  if (!sesion || sesion.tipo !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("profesionales").delete().eq("id", params.id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "No se puede eliminar: tiene turnos cargados. Podés desactivarlo en su lugar." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
