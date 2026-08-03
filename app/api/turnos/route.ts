import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { leerSesion } from "@/lib/auth";

// GET /api/turnos?desde=2026-08-01&hasta=2026-08-31&disciplina_id=&consultorio_id=&profesional_id=
export async function GET(req: NextRequest) {
  const sesion = leerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const disciplinaId = searchParams.get("disciplina_id");
  const consultorioId = searchParams.get("consultorio_id");
  const profesionalId = searchParams.get("profesional_id");

  const supabase = supabaseServer();
  let query = supabase.from("turnos").select("*").order("fecha").order("hora_inicio");

  if (desde) query = query.gte("fecha", desde);
  if (hasta) query = query.lte("fecha", hasta);
  if (disciplinaId) query = query.eq("disciplina_id", disciplinaId);
  if (consultorioId) query = query.eq("consultorio_id", consultorioId);

  // Un profesional logueado solo puede ver sus propios turnos,
  // sin importar que filtros mande el cliente.
  if (sesion.tipo === "profesional") {
    query = query.eq("profesional_id", sesion.profesionalId);
  } else if (profesionalId) {
    query = query.eq("profesional_id", profesionalId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ turnos: data });
}

// POST /api/turnos  (solo admin agenda; el profesional en esta etapa es de solo lectura)
export async function POST(req: NextRequest) {
  const sesion = leerSesion();
  if (!sesion || sesion.tipo !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    paciente_nombre,
    paciente_id,
    profesional_id,
    disciplina_id,
    consultorio_id,
    fecha,
    hora_inicio,
    hora_fin,
    precio,
    cobro_profesional_manual,
    notas,
  } = body;

  if (!profesional_id || !disciplina_id || !consultorio_id || !fecha || !hora_inicio || !hora_fin) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("turnos")
    .insert({
      paciente_nombre: paciente_nombre || null,
      paciente_id: paciente_id || null,
      profesional_id,
      disciplina_id,
      consultorio_id,
      fecha,
      hora_inicio,
      hora_fin,
      precio: precio || 0,
      cobro_profesional_manual: cobro_profesional_manual ?? null,
      notas: notas || null,
      origen: "admin",
      estado: "reservado",
    })
    .select()
    .single();

  if (error) {
    // constraint turno_sin_solape -> ya hay un turno en ese consultorio/horario
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ese consultorio ya tiene un turno agendado en ese horario." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ turno: data }, { status: 201 });
}
