"use client";

import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import type { Consultorio, Disciplina, Turno } from "@/lib/types";
import { aISO, etiquetaDia } from "@/lib/dates";

const ESTADOS: Turno["estado"][] = ["reservado", "confirmado", "atendido", "ausente", "cancelado"];

export default function AgendaProfesionalPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  async function cargar() {
    const desde = aISO(new Date());
    const hasta = aISO(addDays(new Date(), 13));
    const [r1, r2] = await Promise.all([
      fetch(`/api/turnos?desde=${desde}&hasta=${hasta}`),
      fetch("/api/referencia"),
    ]);
    const d1 = await r1.json();
    const d2 = await r2.json();
    setTurnos(d1.turnos || []);
    setConsultorios(d2.consultorios || []);
    setDisciplinas(d2.disciplinas || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id: string, estado: string) {
    await fetch(`/api/turnos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    cargar();
  }

  const porDia = turnos.reduce<Record<string, Turno[]>>((acc, t) => {
    (acc[t.fecha] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <p className="text-tinta-soft text-sm mb-6">Tu agenda de los próximos 14 días.</p>

      {Object.keys(porDia).length === 0 && (
        <p className="text-tinta-faint ec-glass rounded-xl3 shadow-glass p-6 text-center">
          No tenés turnos agendados en este período.
        </p>
      )}

      <div className="space-y-6">
        {Object.entries(porDia).map(([fecha, items]) => (
          <div key={fecha}>
            <h2 className="font-display font-bold text-lg text-tinta capitalize mb-2">
              {etiquetaDia(new Date(fecha + "T00:00:00"))}
            </h2>
            <div className="ec-glass rounded-xl3 shadow-glass divide-y divide-white/40">
              {items.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-tinta">
                      {t.hora_inicio.slice(0, 5)}–{t.hora_fin.slice(0, 5)} · {t.paciente_nombre || "Paciente"}
                    </p>
                    <p className="text-tinta-faint text-xs">
                      {consultorios.find((c) => c.id === t.consultorio_id)?.nombre} ·{" "}
                      {disciplinas.find((d) => d.id === t.disciplina_id)?.nombre}
                    </p>
                  </div>
                  <select
                    value={t.estado}
                    onChange={(e) => cambiarEstado(t.id, e.target.value)}
                    className="border-0 rounded-xl2 px-2.5 py-1 text-xs bg-white/60 text-tinta outline-none focus:ring-2 focus:ring-lavanda/30"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
