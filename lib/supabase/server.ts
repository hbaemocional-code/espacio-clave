import { createClient } from "@supabase/supabase-js";

// Cliente exclusivo de servidor (API routes / server components).
// Usa la Service Role Key: nunca importar este archivo desde un
// componente que corra en el navegador.
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
