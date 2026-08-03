import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { leerSesion } from "@/lib/auth";

// PATCH /api/turnos/:id  -> admin edita cualquier campo; profesional solo puede
// actualizar el estado de SU turno (ej: marcar "atendido" o "ausente").
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = leerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = supabaseServer();
  const body = await req.json();

  if (sesion.tipo === "profesional") {
    const { data: turnoActual } = await supabase
      .from("turnos")
      .select("profesional_id")
      .eq("id", params.id)
      .single();

    if (!turnoActual || turnoActual.profesional_id !== sesion.profesionalId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("turnos")
      .update({ estado: body.estado })
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ turno: data });
  }

  // admin: puede actualizar cualquier campo del turno
  const { data, error } = await supabase
    .from("turnos")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ turno: data });
}

// DELETE /api/turnos/:id -> solo admin
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sesion = leerSesion();
  if (!sesion || sesion.tipo !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const supabase = supabaseServer();
  const { error } = await supabase.from("turnos").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
