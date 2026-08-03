"use client";

import { Building2, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Consultorio, Disciplina } from "@/lib/types";

export type Vista = "dia" | "semana" | "mes" | "consultorios";

type Props = {
  vista: Vista;
  onVista: (v: Vista) => void;
  disciplinas: Disciplina[];
  consultorios: Consultorio[];
  disciplinaId: string;
  onDisciplinaId: (v: string) => void;
  consultorioId: string;
  onConsultorioId: (v: string) => void;
  etiquetaPeriodo: string;
  onAnterior: () => void;
  onSiguiente: () => void;
  onHoy: () => void;
  onNuevoTurno: () => void;
};

const vistaLabel: Record<Vista, string> = {
  dia: "Día",
  semana: "Semana",
  mes: "Mes",
  consultorios: "Consultorios",
};

export default function FiltrosBar({
  vista,
  onVista,
  disciplinas,
  consultorios,
  disciplinaId,
  onDisciplinaId,
  consultorioId,
  onConsultorioId,
  etiquetaPeriodo,
  onAnterior,
  onSiguiente,
  onHoy,
  onNuevoTurno,
}: Props) {
  return (
    <div className="ec-glass rounded-xl3 shadow-glass p-2.5 flex flex-wrap items-center gap-2 mb-6">
      <div className="flex rounded-xl2 bg-white/50 p-1 gap-1">
        {(["dia", "semana", "mes", "consultorios"] as Vista[]).map((v) => (
          <button
            key={v}
            onClick={() => onVista(v)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all ${
              vista === v
                ? "bg-white text-tinta shadow-glass"
                : "text-tinta-soft hover:text-tinta"
            }`}
          >
            {v === "consultorios" && <Building2 className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={2} />}
            {v === "dia" && <CalendarDays className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={2} />}
            {vistaLabel[v]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onAnterior}
          className="w-8 h-8 flex items-center justify-center rounded-xl2 text-tinta-soft hover:bg-white/60 transition"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.2} />
        </button>
        <button
          onClick={onHoy}
          className="px-3 h-8 text-sm font-medium rounded-xl2 text-tinta-soft hover:bg-white/60 transition"
        >
          Hoy
        </button>
        <button
          onClick={onSiguiente}
          className="w-8 h-8 flex items-center justify-center rounded-xl2 text-tinta-soft hover:bg-white/60 transition"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2.2} />
        </button>
        <span className="font-display font-bold text-[15px] text-tinta ml-1.5 capitalize">
          {etiquetaPeriodo}
        </span>
      </div>

      <select
        value={disciplinaId}
        onChange={(e) => onDisciplinaId(e.target.value)}
        className="border-0 rounded-xl2 px-3 py-1.5 text-sm bg-white/50 text-tinta-soft outline-none focus:ring-2 focus:ring-lavanda/30 cursor-pointer"
      >
        <option value="">Todas las disciplinas</option>
        {disciplinas.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      {vista !== "consultorios" && vista !== "dia" && (
        <select
          value={consultorioId}
          onChange={(e) => onConsultorioId(e.target.value)}
          className="border-0 rounded-xl2 px-3 py-1.5 text-sm bg-white/50 text-tinta-soft outline-none focus:ring-2 focus:ring-lavanda/30 cursor-pointer"
        >
          <option value="">Todos los consultorios</option>
          {consultorios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={onNuevoTurno}
        className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl2 bg-gradiente-marca text-white shadow-glow-coral hover:opacity-95 active:scale-[0.98] transition"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Nuevo turno
      </button>
    </div>
  );
}
