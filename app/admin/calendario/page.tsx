"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addMonths, addWeeks } from "date-fns";
import type { Consultorio, Disciplina, Profesional, Turno } from "@/lib/types";
import { aISO, diasDeSemana, etiquetaDia, etiquetaMes } from "@/lib/dates";
import FiltrosBar, { Vista } from "@/components/FiltrosBar";
import VistaSemana from "@/components/VistaSemana";
import VistaMes from "@/components/VistaMes";
import VistaConsultorios from "@/components/VistaConsultorios";
import VistaDia from "@/components/VistaDia";
import TurnoModal from "@/components/TurnoModal";

export default function CalendarioPage() {
  const [vista, setVista] = useState<Vista>("dia");
  const [fechaBase, setFechaBase] = useState(new Date());
  const [disciplinaId, setDisciplinaId] = useState("");
  const [consultorioId, setConsultorioId] = useState("");

  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [slotNuevo, setSlotNuevo] = useState<{ fecha: string; hora: string } | null>(null);

  useEffect(() => {
    fetch("/api/referencia")
      .then((r) => r.json())
      .then((d) => {
        setConsultorios(d.consultorios || []);
        setDisciplinas(d.disciplinas || []);
      });
    fetch("/api/profesionales")
      .then((r) => r.json())
      .then((d) => setProfesionales(d.profesionales || []));
  }, []);

  const rango = useMemo(() => {
    if (vista === "mes") {
      const desde = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1);
      const hasta = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 0);
      return { desde: aISO(desde), hasta: aISO(hasta) };
    }
    if (vista === "consultorios" || vista === "dia") {
      const iso = aISO(fechaBase);
      return { desde: iso, hasta: iso };
    }
    const dias = diasDeSemana(fechaBase);
    return { desde: aISO(dias[0]), hasta: aISO(dias[dias.length - 1]) };
  }, [vista, fechaBase]);

  async function cargarTurnos() {
    const params = new URLSearchParams({ desde: rango.desde, hasta: rango.hasta });
    if (disciplinaId) params.set("disciplina_id", disciplinaId);
    if (consultorioId) params.set("consultorio_id", consultorioId);
    const res = await fetch(`/api/turnos?${params.toString()}`);
    const data = await res.json();
    setTurnos(data.turnos || []);
  }

  useEffect(() => {
    cargarTurnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango.desde, rango.hasta, disciplinaId, consultorioId]);

  function irAnterior() {
    if (vista === "mes") setFechaBase((f) => addMonths(f, -1));
    else if (vista === "consultorios" || vista === "dia") setFechaBase((f) => addDays(f, -1));
    else setFechaBase((f) => addWeeks(f, -1));
  }
  function irSiguiente() {
    if (vista === "mes") setFechaBase((f) => addMonths(f, 1));
    else if (vista === "consultorios" || vista === "dia") setFechaBase((f) => addDays(f, 1));
    else setFechaBase((f) => addWeeks(f, 1));
  }
  function irHoy() {
    setFechaBase(new Date());
  }

  function abrirNuevoTurno(fecha?: string, hora?: string) {
    setTurnoEditando(null);
    setSlotNuevo(fecha && hora ? { fecha, hora } : { fecha: aISO(fechaBase), hora: "09:00" });
    setModalAbierto(true);
  }

  function abrirTurno(t: Turno) {
    setTurnoEditando(t);
    setSlotNuevo(null);
    setModalAbierto(true);
  }

  const etiquetaPeriodo =
    vista === "mes"
      ? etiquetaMes(fechaBase)
      : vista === "consultorios" || vista === "dia"
      ? etiquetaDia(fechaBase)
      : `Semana del ${aISO(diasDeSemana(fechaBase)[0])}`;

  const turnosHoy = turnos.filter((t) => t.fecha === aISO(new Date()) && t.estado !== "cancelado").length;
  const profesionalesActivos = profesionales.filter((p) => p.activo).length;
  const ocupacionPct = consultorios.length
    ? Math.round((new Set(turnos.filter((t) => t.estado !== "cancelado").map((t) => t.consultorio_id)).size / consultorios.length) * 100)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-3xl text-tinta mb-1">Calendario</h1>
        <p className="text-tinta-soft text-sm">
          Agenda de los 8 consultorios de Espacio Clave, por semana, mes o uso por consultorio.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="ec-glass rounded-xl2 shadow-glass px-5 py-4">
          <p className="text-xs text-tinta-faint font-medium mb-1">Turnos de hoy</p>
          <p className="font-display font-extrabold text-2xl text-tinta">{turnosHoy}</p>
        </div>
        <div className="ec-glass rounded-xl2 shadow-glass px-5 py-4">
          <p className="text-xs text-tinta-faint font-medium mb-1">Profesionales activos</p>
          <p className="font-display font-extrabold text-2xl text-tinta">{profesionalesActivos}</p>
        </div>
        <div className="ec-glass rounded-xl2 shadow-glass px-5 py-4">
          <p className="text-xs text-tinta-faint font-medium mb-1">Consultorios en uso (período)</p>
          <p className="font-display font-extrabold text-2xl text-tinta">{ocupacionPct}%</p>
        </div>
      </div>

      <FiltrosBar
        vista={vista}
        onVista={setVista}
        disciplinas={disciplinas}
        consultorios={consultorios}
        disciplinaId={disciplinaId}
        onDisciplinaId={setDisciplinaId}
        consultorioId={consultorioId}
        onConsultorioId={setConsultorioId}
        etiquetaPeriodo={etiquetaPeriodo}
        onAnterior={irAnterior}
        onSiguiente={irSiguiente}
        onHoy={irHoy}
        onNuevoTurno={() => abrirNuevoTurno()}
      />

      {vista === "dia" && (
        <VistaDia
          fechaISO={aISO(fechaBase)}
          turnos={turnos}
          profesionales={profesionales}
          consultorios={consultorios}
          disciplinas={disciplinas}
          onSlotVacio={(_profesionalId, hora) => {
            setTurnoEditando(null);
            setSlotNuevo({ fecha: aISO(fechaBase), hora });
            setModalAbierto(true);
          }}
          onTurno={abrirTurno}
        />
      )}

      {vista === "semana" && (
        <VistaSemana
          fechaBase={fechaBase}
          turnos={turnos}
          disciplinas={disciplinas}
          onSlotVacio={(fecha, hora) => abrirNuevoTurno(fecha, hora)}
          onTurno={abrirTurno}
        />
      )}

      {vista === "mes" && (
        <VistaMes
          fechaBase={fechaBase}
          turnos={turnos}
          disciplinas={disciplinas}
          onDia={(fechaISO) => {
            setFechaBase(new Date(fechaISO + "T00:00:00"));
            setVista("semana");
          }}
        />
      )}

      {vista === "consultorios" && (
        <VistaConsultorios
          fechaISO={aISO(fechaBase)}
          turnos={turnos}
          consultorios={consultorios}
          disciplinas={disciplinas}
          onSlotVacio={(consultorioId, hora) => {
            setTurnoEditando(null);
            setSlotNuevo({ fecha: aISO(fechaBase), hora });
            setModalAbierto(true);
          }}
          onTurno={abrirTurno}
        />
      )}

      <TurnoModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={cargarTurnos}
        profesionales={profesionales}
        disciplinas={disciplinas}
        consultorios={consultorios}
        fechaInicial={slotNuevo?.fecha}
        horaInicial={slotNuevo?.hora}
        turnoExistente={turnoEditando}
      />
    </div>
  );
}
