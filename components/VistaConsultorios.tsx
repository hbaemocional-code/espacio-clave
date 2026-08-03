"use client";

import type { Consultorio, Disciplina, Turno } from "@/lib/types";
import { franjasHorarias } from "@/lib/dates";
import TurnoChip from "./TurnoChip";

type Props = {
  fechaISO: string;
  turnos: Turno[];
  consultorios: Consultorio[];
  disciplinas: Disciplina[];
  onSlotVacio: (consultorioId: number, hora: string) => void;
  onTurno: (t: Turno) => void;
};

export default function VistaConsultorios({
  fechaISO,
  turnos,
  consultorios,
  disciplinas,
  onSlotVacio,
  onTurno,
}: Props) {
  const franjas = franjasHorarias(8, 21, 30);
  const turnosDelDia = turnos.filter((t) => t.fecha === fechaISO && t.estado !== "cancelado");

  function turnoEn(consultorioId: number, hora: string) {
    return turnosDelDia.find(
      (t) => t.consultorio_id === consultorioId && t.hora_inicio.slice(0, 5) === hora
    );
  }

  const libres = consultorios.length - new Set(turnosDelDia.map((t) => t.consultorio_id)).size;

  return (
    <div>
      <div className="ec-glass rounded-xl2 shadow-glass px-4 py-2.5 mb-4 inline-flex items-center gap-4 text-sm">
        <span className="text-tinta">
          <strong className="font-display">{turnosDelDia.length}</strong>{" "}
          <span className="text-tinta-faint">turno{turnosDelDia.length !== 1 ? "s" : ""} hoy</span>
        </span>
        <span className="w-px h-4 bg-tinta-faint/20" />
        <span className="text-tinta">
          <strong className="font-display">{libres}</strong>{" "}
          <span className="text-tinta-faint">de {consultorios.length} consultorios libres</span>
        </span>
      </div>
      <div className="ec-glass rounded-xl3 shadow-glass overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `70px repeat(${consultorios.length}, minmax(90px, 1fr))` }}>
          <div className="border-b border-white/50 bg-white/30" />
          {consultorios.map((c) => (
            <div
              key={c.id}
              className="border-b border-l border-white/50 bg-white/30 px-2 py-3 text-center text-sm font-display font-bold text-tinta"
            >
              {c.nombre}
            </div>
          ))}

          {franjas.map((hora) => (
            <div key={`row-${hora}`} className="contents">
              <div className="border-b border-white/40 px-2 py-2 text-[12.5px] font-medium text-tinta-soft text-right">
                {hora}
              </div>
              {consultorios.map((c) => {
                const t = turnoEn(c.id, hora);
                return (
                  <div
                    key={`${c.id}-${hora}`}
                    onClick={() => !t && onSlotVacio(c.id, hora)}
                    className="border-b border-l border-white/40 min-h-[38px] px-1 py-1 hover:bg-lavanda-soft/40 cursor-pointer transition-colors"
                  >
                    {t && (
                      <TurnoChip
                        turno={t}
                        disciplina={disciplinas.find((d) => d.id === t.disciplina_id)}
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
    </div>
  );
}
