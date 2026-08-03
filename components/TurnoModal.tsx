"use client";

import { useEffect, useState } from "react";
import type { Consultorio, Disciplina, Profesional, Turno } from "@/lib/types";
import { sumarMinutos } from "@/lib/dates";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: () => void;
  profesionales: Profesional[];
  disciplinas: Disciplina[];
  consultorios: Consultorio[];
  fechaInicial?: string;
  horaInicial?: string;
  turnoExistente?: Turno | null;
};

export default function TurnoModal({
  abierto,
  onCerrar,
  onGuardado,
  profesionales,
  disciplinas,
  consultorios,
  fechaInicial,
  horaInicial,
  turnoExistente,
}: Props) {
  const [profesionalId, setProfesionalId] = useState("");
  const [consultorioId, setConsultorioId] = useState("");
  const [fecha, setFecha] = useState(fechaInicial || "");
  const [horaInicio, setHoraInicio] = useState(horaInicial || "09:00");
  const [duracion, setDuracion] = useState(50);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [ajusteManual, setAjusteManual] = useState<string>("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (turnoExistente) {
      setProfesionalId(turnoExistente.profesional_id);
      setConsultorioId(String(turnoExistente.consultorio_id));
      setFecha(turnoExistente.fecha);
      setHoraInicio(turnoExistente.hora_inicio.slice(0, 5));
      setPacienteNombre(turnoExistente.paciente_nombre || "");
      setPrecio(Number(turnoExistente.precio));
      setAjusteManual(
        turnoExistente.cobro_profesional_manual !== null &&
          turnoExistente.cobro_profesional_manual !== undefined
          ? String(turnoExistente.cobro_profesional_manual)
          : ""
      );
      setNotas(turnoExistente.notas || "");
    } else {
      setProfesionalId("");
      setConsultorioId("");
      setFecha(fechaInicial || "");
      setHoraInicio(horaInicial || "09:00");
      setPacienteNombre("");
      setPrecio(0);
      setAjusteManual("");
      setNotas("");
    }
    setError(null);
  }, [turnoExistente, fechaInicial, horaInicial, abierto]);

  useEffect(() => {
    const prof = profesionales.find((p) => p.id === profesionalId);
    if (prof) {
      setPrecio((actual) => (actual ? actual : prof.precio_consulta));
      if (prof.consultorio_fijo_id && !turnoExistente) {
        setConsultorioId(String(prof.consultorio_fijo_id));
      }
    }
  }, [profesionalId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!abierto) return null;

  const profesionalSeleccionado = profesionales.find((p) => p.id === profesionalId);

  async function guardar() {
    setError(null);
    if (!profesionalId || !consultorioId || !fecha || !horaInicio) {
      setError("Completá profesional, consultorio, fecha y horario.");
      return;
    }
    setGuardando(true);
    try {
      const horaFin = sumarMinutos(horaInicio, duracion);
      const payload = {
        profesional_id: profesionalId,
        disciplina_id: profesionalSeleccionado?.disciplina_id,
        consultorio_id: Number(consultorioId),
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        precio,
        cobro_profesional_manual: ajusteManual.trim() === "" ? null : Number(ajusteManual),
        paciente_nombre: pacienteNombre,
        notas,
      };

      const url = turnoExistente ? `/api/turnos/${turnoExistente.id}` : "/api/turnos";
      const method = turnoExistente ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el turno");
        return;
      }
      onGuardado();
      onCerrar();
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!turnoExistente) return;
    if (!confirm("¿Cancelar y eliminar este turno?")) return;
    setGuardando(true);
    try {
      await fetch(`/api/turnos/${turnoExistente.id}`, { method: "DELETE" });
      onGuardado();
      onCerrar();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-tinta/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="ec-glass-strong rounded-xl3 w-full max-w-md flex flex-col max-h-[90vh] shadow-glass-lg overflow-hidden">
        
        {/* Header (Fijo arriba) */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/20">
          <h2 className="font-display font-extrabold text-xl text-tinta">
            {turnoExistente ? "Editar turno" : "Nuevo turno"}
          </h2>
          <button onClick={onCerrar} className="text-tinta-faint hover:text-tinta transition">
            ✕
          </button>
        </div>

        {/* Body con Scroll interno */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-tinta-soft">Profesional</label>
              <select
                value={profesionalId}
                onChange={(e) => setProfesionalId(e.target.value)}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              >
                <option value="">Seleccionar…</option>
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {disciplinas.find((d) => d.id === p.disciplina_id)?.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-tinta-soft">Consultorio</label>
              <select
                value={consultorioId}
                onChange={(e) => setConsultorioId(e.target.value)}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              >
                <option value="">Seleccionar…</option>
                {consultorios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-tinta-soft">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tinta-soft">Hora inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tinta-soft">Duración (min)</label>
              <input
                type="number"
                step={5}
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-tinta-soft">Paciente</label>
              <input
                value={pacienteNombre}
                onChange={(e) => setPacienteNombre(e.target.value)}
                placeholder="Nombre del paciente"
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tinta-soft">Precio ($)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              />
            </div>

            {profesionalSeleccionado?.modalidad_facturacion === "modulo" && (
              <div className="col-span-2 bg-coral-soft/40 rounded-xl2 p-3">
                <label className="text-xs font-medium text-tinta-soft">
                  Ajustar cobro profesional para este turno (opcional)
                </label>
                <input
                  type="number"
                  value={ajusteManual}
                  onChange={(e) => setAjusteManual(e.target.value)}
                  placeholder={`Automático: $${Math.max(
                    0,
                    precio - Number(profesionalSeleccionado.valor_modulo_consultorio || 0)
                  ).toLocaleString("es-AR")}`}
                  className="w-full border border-white/60 bg-white/80 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-coral/40 transition"
                />
                <p className="text-[10px] text-tinta-faint mt-1">
                  Dejalo vacío para que se calcule solo (precio − ${Number(
                    profesionalSeleccionado.valor_modulo_consultorio || 0
                  ).toLocaleString("es-AR")} del consultorio). Completalo solo si hubo otro arreglo
                  puntual con el profesional para este turno — va a quedar marcado como corregido
                  a mano en el cierre.
                </p>
              </div>
            )}

            <div className="col-span-2">
              <label className="text-xs font-medium text-tinta-soft">Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              />
            </div>
          </div>

          {turnoExistente && (
            <div>
              <label className="text-xs font-medium text-tinta-soft">Estado</label>
              <select
                value={turnoExistente.estado}
                onChange={async (e) => {
                  await fetch(`/api/turnos/${turnoExistente.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: e.target.value }),
                  });
                  onGuardado();
                }}
                className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
              >
                <option value="reservado">Reservado</option>
                <option value="confirmado">Confirmado</option>
                <option value="atendido">Atendido</option>
                <option value="ausente">Ausente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          )}

          {error && <p className="text-sm text-coral-dark bg-coral-soft rounded-xl2 px-3 py-2">{error}</p>}
        </div>

        {/* Footer (Fijo abajo) */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-white/20">
          {turnoExistente ? (
            <button
              onClick={eliminar}
              disabled={guardando}
              className="text-sm font-medium text-coral-dark hover:underline"
            >
              Eliminar turno
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onCerrar}
              className="px-4 py-2 text-sm font-medium rounded-xl2 bg-white/60 text-tinta-soft hover:bg-white/80 transition"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando}
              className="px-4 py-2 text-sm font-semibold rounded-xl2 bg-gradiente-marca text-white shadow-glow-coral hover:opacity-95 active:scale-[0.98] transition"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}