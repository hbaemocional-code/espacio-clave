import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { leerSesion } from "@/lib/auth";
import { buildContextoDatos, buildSystemPrompt } from "@/lib/asistente";
import { aISO } from "@/lib/dates";
import { addDays } from "date-fns";

const MODELO_GROQ = "openai/gpt-oss-120b";

type MensajeChat = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const sesion = leerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar GROQ_API_KEY en las variables de entorno." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const historial: MensajeChat[] = Array.isArray(body.mensajes) ? body.mensajes : [];
  if (historial.length === 0) {
    return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const hoy = new Date();
  const desde = aISO(hoy);
  const hasta = aISO(addDays(hoy, 30));

  let turnosQuery = supabase
    .from("turnos")
    .select("*")
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha")
    .order("hora_inicio");

  if (sesion.tipo === "profesional") {
    turnosQuery = turnosQuery.eq("profesional_id", sesion.profesionalId);
  }

  const [{ data: turnos }, { data: profesionales }, { data: consultorios }, { data: disciplinas }] =
    await Promise.all([
      turnosQuery,
      supabase.from("profesionales").select("*"),
      supabase.from("consultorios").select("*").order("id"),
      supabase.from("disciplinas").select("*").order("id"),
    ]);

  const contextoDatos = buildContextoDatos({
    sesion,
    hoy,
    turnos: (turnos as any) || [],
    profesionales: (profesionales as any) || [],
    consultorios: (consultorios as any) || [],
    disciplinas: (disciplinas as any) || [],
  });

  const systemPrompt = buildSystemPrompt(contextoDatos);

  const mensajesGroq = [
    { role: "system", content: systemPrompt },
    ...historial.slice(-16), // últimos turnos de conversación, para no crecer sin límite
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELO_GROQ,
        messages: mensajesGroq,
        temperature: 0.4,
        max_completion_tokens: 700,
      }),
    });

    if (!res.ok) {
      const detalle = await res.text();
      console.error("Error de Groq:", detalle);
      return NextResponse.json({ error: "El asistente no pudo responder en este momento." }, { status: 502 });
    }

    const data = await res.json();
    const respuesta = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";
    return NextResponse.json({ respuesta });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se pudo conectar con el asistente." }, { status: 500 });
  }
}
