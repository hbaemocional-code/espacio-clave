"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, Sparkles, X } from "lucide-react";

type Mensaje = { role: "user" | "assistant"; content: string };

const SALUDO_INICIAL: Mensaje = {
  role: "assistant",
  content:
    "¡Hola! Soy Clave 👋 Puedo ayudarte con la agenda, datos de profesionales, cálculos de cierre o cualquier duda del día a día del consultorio. ¿En qué te ayudo?",
};

export default function AsistenteClave() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO_INICIAL]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, abierto]);

  async function enviar() {
    const contenido = texto.trim();
    if (!contenido || cargando) return;
    setError(null);
    setTexto("");

    const nuevosMensajes: Mensaje[] = [...mensajes, { role: "user", content: contenido }];
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensajes: nuevosMensajes.filter((m) => m !== SALUDO_INICIAL),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo obtener respuesta.");
        return;
      }
      setMensajes((prev) => [...prev, { role: "assistant", content: data.respuesta }]);
    } catch {
      setError("No se pudo conectar con el asistente.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradiente-marca shadow-glow-coral flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Abrir asistente Clave"
        >
          <Image
            src="/brand/clave-mascota.png"
            alt="Clave"
            width={44}
            height={44}
            className="object-cover rounded-full"
          />
        </button>
      )}

      {/* Panel de chat */}
      {abierto && (
        <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] flex flex-col ec-glass-strong rounded-xl3 shadow-glass-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradiente-marca">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/30 shrink-0">
                <Image
                  src="/brand/clave-mascota.png"
                  alt="Clave"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="text-sm font-display font-bold text-white flex items-center gap-1">
                  Clave <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                </p>
                <p className="text-[10px] text-white/75">Asistente de Espacio Clave</p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="text-white/80 hover:text-white transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl2 px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gradiente-marca text-white rounded-br-sm"
                      : "bg-white/70 text-tinta rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-white/70 rounded-xl2 rounded-bl-sm px-3.5 py-2.5 text-sm text-tinta-faint">
                  Clave está pensando…
                </div>
              </div>
            )}
            {error && <p className="text-xs text-coral-dark bg-coral-soft rounded-xl2 px-3 py-2">{error}</p>}
          </div>

          <div className="p-3 border-t border-white/40">
            <div className="flex items-center gap-2">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder="Escribile a Clave…"
                className="flex-1 bg-white/70 rounded-xl2 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-lavanda/40"
              />
              <button
                onClick={enviar}
                disabled={cargando || !texto.trim()}
                className="w-10 h-10 rounded-xl2 bg-gradiente-marca text-white flex items-center justify-center shadow-glow-coral hover:opacity-95 disabled:opacity-40 transition shrink-0"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
