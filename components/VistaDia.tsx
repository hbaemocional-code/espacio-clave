"use client";

import type { Consultorio, Disciplina, Profesional, Turno } from "@/lib/types";
import { franjasHorarias } from "@/lib/dates";
import TurnoChip from "./TurnoChip";

type Props = {
  fechaISO: string;
  turnos: Turno[];
  profesionales: Profesional[];
  consultorios: Consultorio[];
  disciplinas: Disciplina[];
  onSlotVacio: (profesionalId: string, hora: string) => void;
  onTurno: (t: Turno) => void;
};

export default function VistaDia({
  fechaISO,
  turnos,
  profesionales,
  consultorios,
  disciplinas,
  onSlotVacio,
  onTurno,
}: Props) {
  const franjas = franjasHorarias(8, 21, 30);
  const turnosDelDia = turnos.filter((t) => t.fecha === fechaISO && t.estado !== "cancelado");

  // Solo mostramos profesionales activos, y priorizamos a los que
  // tienen turnos hoy (para que la grilla no quede eterna cuando hay
  // muchos profesionales cargados pero pocos trabajando ese día).
  const profesionalesConTurnoHoy = new Set(turnosDelDia.map((t) => t.profesional_id));
  const columnas = profesionales
    .filter((p) => p.activo)
    .sort((a, b) => {
      const aTiene = profesionalesConTurnoHoy.has(a.id) ? 0 : 1;
      const bTiene = profesionalesConTurnoHoy.has(b.id) ? 0 : 1;
      if (aTiene !== bTiene) return aTiene - bTiene;
      return a.nombre.localeCompare(b.nombre);
    });

  function turnoDe(profesionalId: string, hora: string) {
    return turnosDelDia.find(
      (t) => t.profesional_id === profesionalId && t.hora_inicio.slice(0, 5) === hora
    );
  }

  if (columnas.length === 0) {
    return (
      <div className="ec-glass rounded-xl3 shadow-glass p-10 text-center text-tinta-faint">
        Todavía no hay profesionales cargados. Agregalos desde "Profesionales".
      </div>
    );
  }

  return (
    <div className="ec-glass rounded-xl3 shadow-glass overflow-x-auto">
      <div
        className="grid"
        style={{ gridTemplateColumns: `70px repeat(${columnas.length}, minmax(170px, 1fr))` }}
      >
        <div className="border-b border-white/50 bg-white/30" />
        {columnas.map((p) => {
          const disc = disciplinas.find((d) => d.id === p.disciplina_id);
          return (
            <div
              key={p.id}
              className="border-b border-l border-white/50 bg-white/30 px-3 py-3 text-center"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: disc?.color }} />
                <p className="text-sm font-display font-bold text-tinta truncate">{p.nombre}</p>
              </div>
              <p className="text-[11px] text-tinta-faint truncate">{disc?.nombre}</p>
            </div>
          );
        })}

        {franjas.map((hora) => (
          <div key={`row-${hora}`} className="contents">
            <div className="border-b border-white/40 px-2 py-2 text-[12.5px] font-medium text-tinta-soft text-right">
              {hora}
            </div>
            {columnas.map((p) => {
              const t = turnoDe(p.id, hora);
              return (
                <div
                  key={`${p.id}-${hora}`}
                  onClick={() => !t && onSlotVacio(p.id, hora)}
                  className="border-b border-l border-white/40 min-h-[38px] px-1 py-1 hover:bg-lavanda-soft/40 cursor-pointer transition-colors"
                >
                  {t && (
                    <TurnoChip
                      turno={t}
                      disciplina={disciplinas.find((d) => d.id === t.disciplina_id)}
                      detalle={consultorios.find((c) => c.id === t.consultorio_id)?.nombre.replace("Consultorio ", "C")}
                      onClick={() => onTurno(t)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
