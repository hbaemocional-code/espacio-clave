"use client";

import { addDays, endOfMonth, format, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import type { Disciplina, Turno } from "@/lib/types";
import { aISO } from "@/lib/dates";

type Props = {
  fechaBase: Date;
  turnos: Turno[];
  disciplinas: Disciplina[];
  onDia: (fechaISO: string) => void;
};

export default function VistaMes({ fechaBase, turnos, disciplinas, onDia }: Props) {
  const inicioMes = startOfMonth(fechaBase);
  const finMes = endOfMonth(fechaBase);
  const inicioGrilla = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const dias: Date[] = [];
  let cursor = inicioGrilla;
  while (cursor <= finMes || dias.length % 7 !== 0) {
    dias.push(cursor);
    cursor = addDays(cursor, 1);
    if (dias.length > 42) break;
  }

  function turnosDelDia(fechaISO: string) {
    return turnos.filter((t) => t.fecha === fechaISO && t.estado !== "cancelado");
  }

  return (
    <div className="ec-glass rounded-xl3 shadow-glass overflow-hidden">
      <div className="grid grid-cols-7 bg-white/30">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div
            key={d}
            className="px-2 py-2.5 text-xs font-display font-bold text-tinta text-center border-b border-white/50"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((d) => {
          const fechaISO = aISO(d);
          const items = turnosDelDia(fechaISO);
          const disciplinasDelDia = Array.from(new Set(items.map((t) => t.disciplina_id)));
          return (
            <button
              key={fechaISO}
              onClick={() => onDia(fechaISO)}
              className={`text-left border-b border-l border-white/40 min-h-[92px] p-2 hover:bg-lavanda-soft/40 transition-colors ${
                isSameMonth(d, fechaBase) ? "" : "opacity-40"
              }`}
            >
              <span
                className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  isToday(d) ? "bg-gradiente-marca text-white shadow-glow-coral" : "text-tinta"
                }`}
              >
                {format(d, "d")}
              </span>
              {items.length > 0 && (
                <p className="text-[11px] text-tinta-faint mt-1.5">
                  {items.length} turno{items.length > 1 ? "s" : ""}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {disciplinasDelDia.map((id) => {
                  const disc = disciplinas.find((x) => x.id === id);
                  return (
                    <span
                      key={id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: disc?.color }}
                      title={disc?.nombre}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
