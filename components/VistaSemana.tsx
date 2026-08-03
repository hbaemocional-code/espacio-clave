"use client";

import React from "react";
import type { Disciplina, Turno } from "@/lib/types";
import { aISO, diasDeSemana, etiquetaDia, franjasHorarias } from "@/lib/dates";
import TurnoChip from "./TurnoChip";

type Props = {
  fechaBase: Date;
  turnos: Turno[];
  disciplinas: Disciplina[];
  onSlotVacio: (fechaISO: string, hora: string) => void;
  onTurno: (t: Turno) => void;
};

export default function VistaSemana({ fechaBase, turnos, disciplinas, onSlotVacio, onTurno }: Props) {
  const dias = diasDeSemana(fechaBase);
  const franjas = franjasHorarias(8, 21, 30);

  function turnosDe(fechaISO: string, hora: string) {
    return turnos.filter((t) => t.fecha === fechaISO && t.hora_inicio.slice(0, 5) === hora);
  }

  return (
    <div className="ec-glass rounded-xl3 shadow-glass overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: "70px repeat(6, 1fr)" }}>
        <div className="border-b border-white/50 bg-white/30" />
        {dias.map((d) => (
          <div
            key={d.toISOString()}
            className="border-b border-l border-white/50 bg-white/30 px-2 py-3 text-center"
          >
            <p className="text-sm capitalize text-tinta font-display font-bold">{etiquetaDia(d)}</p>
          </div>
        ))}

        {franjas.map((hora) => (
          <React.Fragment key={`fila-${hora}`}>
            <div className="border-b border-white/40 px-2 py-2 text-[12.5px] font-medium text-tinta-soft text-right">
              {hora}
            </div>
            {dias.map((d) => {
              const fechaISO = aISO(d);
              const items = turnosDe(fechaISO, hora);
              return (
                <div
                  key={`${fechaISO}-${hora}`}
                  onClick={() => items.length === 0 && onSlotVacio(fechaISO, hora)}
                  className="border-b border-l border-white/40 min-h-[38px] px-1 py-1 hover:bg-lavanda-soft/40 cursor-pointer space-y-1 transition-colors"
                >
                  {items.map((t) => (
                    <TurnoChip
                      key={t.id}
                      turno={t}
                      disciplina={disciplinas.find((disc) => disc.id === t.disciplina_id)}
                      onClick={() => onTurno(t)}
                    />
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
