"use client";

import { useEffect, useState } from "react";
import type { Consultorio, Disciplina, ModalidadFacturacion, Profesional } from "@/lib/types";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: () => void;
  disciplinas: Disciplina[];
  consultorios: Consultorio[];
  profesionalExistente?: Profesional | null;
};

export default function ProfesionalModal({
  abierto,
  onCerrar,
  onGuardado,
  disciplinas,
  consultorios,
  profesionalExistente,
}: Props) {
  const esEdicion = !!profesionalExistente;

  const [nombre, setNombre] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [consultorioFijoId, setConsultorioFijoId] = useState("");
  const [modalidad, setModalidad] = useState<ModalidadFacturacion>("porcentaje");
  const [porcentaje, setPorcentaje] = useState(60);
  const [precioConsulta, setPrecioConsulta] = useState(0);
  const [valorModuloConsultorio, setValorModuloConsultorio] = useState(0);
  const [valorBloqueConsultorio, setValorBloqueConsultorio] = useState(0);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (profesionalExistente) {
      setNombre(profesionalExistente.nombre);
      setDisciplinaId(String(profesionalExistente.disciplina_id));
      setConsultorioFijoId(profesionalExistente.consultorio_fijo_id ? String(profesionalExistente.consultorio_fijo_id) : "");
      setModalidad(profesionalExistente.modalidad_facturacion || "porcentaje");
      setPorcentaje(Number(profesionalExistente.porcentaje_profesional));
      setPrecioConsulta(Number(profesionalExistente.precio_consulta));
      setValorModuloConsultorio(Number(profesionalExistente.valor_modulo_consultorio || 0));
      setValorBloqueConsultorio(Number(profesionalExistente.valor_bloque_consultorio || 0));
      setUsuario(profesionalExistente.usuario);
      setActivo(profesionalExistente.activo);
      setPassword("");
    } else {
      setNombre("");
      setDisciplinaId("");
      setConsultorioFijoId("");
      setModalidad("porcentaje");
      setPorcentaje(60);
      setPrecioConsulta(0);
      setValorModuloConsultorio(0);
      setValorBloqueConsultorio(0);
      setUsuario("");
      setPassword("");
      setActivo(true);
    }
    setError(null);
  }, [profesionalExistente, abierto]);

  if (!abierto) return null;

  async function guardar() {
    setError(null);
    if (!nombre || !disciplinaId || !usuario || (!esEdicion && !password)) {
      setError("Completá nombre, disciplina, usuario y contraseña.");
      return;
    }
    setGuardando(true);
    try {
      const payload: Record<string, unknown> = {
        nombre,
        disciplina_id: Number(disciplinaId),
        consultorio_fijo_id: consultorioFijoId ? Number(consultorioFijoId) : null,
        modalidad_facturacion: modalidad,
        porcentaje_profesional: porcentaje,
        precio_consulta: precioConsulta,
        valor_modulo_consultorio: valorModuloConsultorio,
        valor_bloque_consultorio: valorBloqueConsultorio,
        usuario,
      };
      if (password) payload.password = password;
      if (esEdicion) payload.activo = activo;

      const url = esEdicion ? `/api/profesionales/${profesionalExistente!.id}` : "/api/profesionales";
      const method = esEdicion ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el profesional");
        return;
      }
      onGuardado();
      onCerrar();
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!profesionalExistente) return;
    if (!confirm(`¿Eliminar a ${profesionalExistente.nombre}? Si tiene turnos cargados, mejor desactivalo.`)) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/profesionales/${profesionalExistente.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar");
        return;
      }
      onGuardado();
      onCerrar();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-tinta/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="ec-glass-strong rounded-xl3 w-full max-w-lg flex flex-col max-h-[90vh] shadow-glass-lg overflow-hidden">
        
        {/* Header (Fijo arriba) */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/20">
          <h2 className="font-display font-extrabold text-xl text-tinta">
            {esEdicion ? `Editar ${profesionalExistente!.nombre}` : "Nuevo profesional"}
          </h2>
          <button onClick={onCerrar} className="text-tinta-faint hover:text-tinta transition">
            ✕
          </button>
        </div>

        {/* Body (Con scroll interno) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Datos generales */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-lavanda mb-2">Datos generales</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-tinta-soft">Nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-tinta-soft">Disciplina</label>
                <select
                  value={disciplinaId}
                  onChange={(e) => setDisciplinaId(e.target.value)}
                  className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
                >
                  <option value="">Seleccionar…</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-tinta-soft">Consultorio fijo</label>
                <select
                  value={consultorioFijoId}
                  onChange={(e) => setConsultorioFijoId(e.target.value)}
                  className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
                >
                  <option value="">Rota entre consultorios</option>
                  {consultorios.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parte contable */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-coral mb-2">Parte contable</p>
            <div className="bg-coral-soft/40 rounded-xl2 p-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-tinta-soft">Modalidad de facturación</label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value as ModalidadFacturacion)}
                  className="w-full border border-white/60 bg-white/80 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-coral/40 transition"
                >
                  <option value="porcentaje">Porcentaje</option>
                  <option value="modulo">Módulo de horas (45' / 1h)</option>
                  <option value="bloque">Bloque de horas</option>
                </select>
              </div>

              {modalidad === "porcentaje" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-tinta-soft">% que le corresponde</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={porcentaje}
                      onChange={(e) => setPorcentaje(Number(e.target.value))}
                      className="w-full border border-white/60 bg-white/80 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-coral/40 transition"
                    />
                    <p className="text-[10px] text-tinta-faint mt-1">
                      El {100 - porcentaje}% restante queda para el consultorio.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-tinta-soft">Precio de consulta ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={precioConsulta}
                      onChange={(e) => setPrecioConsulta(Number(e.target.value))}
                      className="w-full border border-white/60 bg-white/80 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-coral/40 transition"
                    />
                  </div>
                </div>
              )}

              {modalidad === "modulo" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-tinta-soft">Precio de consulta ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={precioConsulta}
                      onChange={(e) => setPrecioConsulta(Number(e.target.value))}
                      className="w-full border border-white/60 bg-white/80 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-coral/40 transition"
                    />
                    <p className="text-[10px] text-tinta-faint mt-1">Lo que paga el paciente por defecto.</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-tinta-soft">Cobro consultorio / módulo ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={valorModuloConsultorio}
                      onChange={(e) => setValorModuloConsultorio(Number(e.target.value))}
                      className="w-full border border-white/60 bg-white/80 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-coral/40 transition"
                    />
                  </div>
                  <p className="col-span-2 text-[10px] text-tinta-faint">
                    Lo que le queda al profesional sale automático: precio del turno menos este
                    fijo. Cada turno vale lo mismo sin importar si dura 45' o 1h, y se puede
                    ajustar puntualmente desde el turno si hubo otro arreglo.
                  </p>
                </div>
              )}

              {modalidad === "bloque" && (
                <div>
                  <label className="text-xs font-medium text-tinta-soft">Cobro consultorio por bloque ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={valorBloqueConsultorio}
                    onChange={(e) => setValorBloqueConsultorio(Number(e.target.value))}
                    className="w-full border border-white/60 bg-white/80 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-coral/40 transition"
                  />
                  <p className="text-[10px] text-tinta-faint mt-1">
                    Se cuenta 1 bloque por cada día con turnos atendidos cargados en la agenda. Lo
                    que el profesional cobra a sus pacientes no pasa por el consultorio.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acceso */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-lavanda mb-2">Acceso al sistema</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-tinta-soft">Usuario</label>
                <input
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-tinta-soft">
                  {esEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={esEdicion ? "Dejar vacío para no cambiar" : ""}
                  className="w-full border border-white/60 bg-white/70 rounded-xl2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 transition"
                />
              </div>
            </div>
            {esEdicion && (
              <label className="flex items-center gap-2 mt-3 text-sm text-tinta-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 rounded accent-lavanda"
                />
                Profesional activo (puede iniciar sesión y aparece en el calendario)
              </label>
            )}
          </div>

          {error && <p className="text-sm text-coral-dark bg-coral-soft rounded-xl2 px-3 py-2">{error}</p>}
        </div>

        {/* Footer (Fijo abajo) */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-white/20">
          {esEdicion ? (
            <button onClick={eliminar} disabled={guardando} className="text-sm font-medium text-coral-dark hover:underline">
              Eliminar profesional
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