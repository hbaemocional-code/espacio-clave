import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { leerSesion } from "@/lib/auth";

export async function GET() {
  const sesion = leerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = supabaseServer();
  const [{ data: consultorios }, { data: disciplinas }] = await Promise.all([
    supabase.from("consultorios").select("*").order("id"),
    supabase.from("disciplinas").select("*").order("id"),
  ]);

  return NextResponse.json({ consultorios, disciplinas });
}
