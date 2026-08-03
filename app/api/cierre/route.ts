import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { leerSesion } from "@/lib/auth";
import { calcularCierreMensual } from "@/lib/calc";

// GET /api/cierre?anio=2026&mes=8  -> calcula en vivo (no persiste)
// POST /api/cierre?anio=2026&mes=8 -> calcula y guarda el snapshot en cierres_mensuales
export async function GET(req: NextRequest) {
  const sesion = leerSesion();
  if (!sesion || sesion.tipo !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const anio = Number(searchParams.get("anio"));
  const mes = Number(searchParams.get("mes")); // 1-12
  if (!anio || !mes) {
    return NextResponse.json({ error: "Faltan anio y mes" }, { status: 400 });
  }

  const desde = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const hasta = `${anio}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

  const supabase = supabaseServer();
  const [{ data: turnos, error: e1 }, { data: profesionales, error: e2 }] = await Promise.all([
    supabase.from("turnos").select("*").gte("fecha", desde).lte("fecha", hasta),
    supabase.from("profesionales").select("*"),
  ]);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  const resumen = calcularCierreMensual(turnos as any, profesionales as any);
  return NextResponse.json({ anio, mes, resumen });
}

export async function POST(req: NextRequest) {
  const sesion = leerSesion();
  if (!sesion || sesion.tipo !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const anio = Number(searchParams.get("anio"));
  const mes = Number(searchParams.get("mes"));
  if (!anio || !mes) {
    return NextResponse.json({ error: "Faltan anio y mes" }, { status: 400 });
  }

  const desde = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const hasta = `${anio}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

  const supabase = supabaseServer();
  const [{ data: turnos, error: e1 }, { data: profesionales, error: e2 }] = await Promise.all([
    supabase.from("turnos").select("*").gte("fecha", desde).lte("fecha", hasta),
    supabase.from("profesionales").select("*"),
  ]);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  const resumen = calcularCierreMensual(turnos as any, profesionales as any);

  const filas = resumen.map((r) => ({
    anio,
    mes,
    profesional_id: r.profesionalId,
    modalidad_facturacion: r.modalidad,
    cantidad_turnos: r.cantidadTurnos,
    cantidad_bloques: r.cantidadBloques,
    total_facturado: r.totalFacturado,
    total_profesional: r.totalProfesional,
    total_consultorio: r.totalConsultorio,
  }));

  const { error: e3 } = await supabase
    .from("cierres_mensuales")
    .upsert(filas, { onConflict: "anio,mes,profesional_id" });

  if (e3) return NextResponse.json({ error: e3.message }, { status: 500 });
  return NextResponse.json({ ok: true, resumen });
}
