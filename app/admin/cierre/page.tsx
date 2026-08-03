"use client";

import { useEffect, useState } from "react";
import type { ResumenProfesional } from "@/lib/calc";

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function CierrePage() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [resumen, setResumen] = useState<ResumenProfesional[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function calcular() {
    setCargando(true);
    setGuardado(false);
    try {
      const res = await fetch(`/api/cierre?anio=${anio}&mes=${mes}`);
      const data = await res.json();
      setResumen(data.resumen || []);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    calcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio, mes]);

  async function cerrarMes() {
    setCargando(true);
    try {
      const res = await fetch(`/api/cierre?anio=${anio}&mes=${mes}`, { method: "POST" });
      const data = await res.json();
      setResumen(data.resumen || []);
      setGuardado(true);
    } finally {
      setCargando(false);
    }
  }

  const totales = resumen.reduce(
    (acc, r) => ({
      turnos: acc.turnos + r.cantidadTurnos,
      facturado: acc.facturado + r.totalFacturado,
      profesional: acc.profesional + r.totalProfesional,
      consultorio: acc.consultorio + r.totalConsultorio,
    }),
    { turnos: 0, facturado: 0, profesional: 0, consultorio: 0 }
  );

  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl text-tinta mb-1">Cierre mensual</h1>
      <p className="text-tinta-soft text-sm mb-6">
        Cálculo de lo que corresponde a cada profesional y al consultorio, según su modalidad de
        facturación (porcentaje, módulo o bloque de horas). Solo se contabilizan los turnos
        marcados como <strong>atendido</strong>.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="border-0 rounded-xl2 px-3 py-2 text-sm bg-white/60 text-tinta outline-none focus:ring-2 focus:ring-lavanda/30"
        >
          {NOMBRES_MES.map((n, i) => (
            <option key={n} value={i + 1}>
              {n}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="border-0 rounded-xl2 px-3 py-2 text-sm bg-white/60 text-tinta outline-none focus:ring-2 focus:ring-lavanda/30 w-24"
        />
        <button
          onClick={cerrarMes}
          disabled={cargando}
          className="ml-auto px-4 py-2 text-sm font-semibold rounded-xl2 bg-gradiente-marca text-white shadow-glow-coral hover:opacity-95 active:scale-[0.98] transition disabled:opacity-50"
        >
          Cerrar y guardar este mes
        </button>
      </div>

      {guardado && (
        <p className="mb-4 text-sm text-tinta ec-glass rounded-xl2 px-4 py-2.5">
          Cierre guardado. Podés volver a generarlo cuando quieras, se actualiza sobre el mismo mes.
        </p>
      )}

      <div className="ec-glass rounded-xl3 shadow-glass overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white/30 text-tinta-faint text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2">Profesional</th>
              <th className="text-left px-4 py-2">Modalidad</th>
              <th className="text-right px-4 py-2">Turnos atendidos</th>
              <th className="text-right px-4 py-2">Bloques</th>
              <th className="text-right px-4 py-2">Total facturado</th>
              <th className="text-right px-4 py-2">Corresponde profesional</th>
              <th className="text-right px-4 py-2">Corresponde consultorio</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map((r) => (
              <tr key={r.profesionalId} className="border-t border-white/40 hover:bg-white/30 transition-colors">
                <td className="px-4 py-2">{r.nombre}</td>
                <td className="px-4 py-2 text-tinta-faint text-xs capitalize">{r.modalidad}</td>
                <td className="px-4 py-2 text-right">{r.cantidadTurnos}</td>
                <td className="px-4 py-2 text-right">{r.modalidad === "bloque" ? r.cantidadBloques : "—"}</td>
                <td className="px-4 py-2 text-right">
                  ${r.totalFacturado.toLocaleString("es-AR")}
                  {r.modalidad === "bloque" && (
                    <span className="block text-[10px] text-tinta-faint">solo referencia</span>
                  )}
                  {r.modalidad === "modulo" && r.cantidadAjustesManual > 0 && (
                    <span className="block text-[10px] text-coral-dark">
                      {r.cantidadAjustesManual} turno{r.cantidadAjustesManual > 1 ? "s" : ""} corregido
                      {r.cantidadAjustesManual > 1 ? "s" : ""} a mano
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right text-lavanda-dark font-semibold">
                  {r.modalidad === "bloque" ? "—" : `$${r.totalProfesional.toLocaleString("es-AR")}`}
                </td>
                <td className="px-4 py-2 text-right">${r.totalConsultorio.toLocaleString("es-AR")}</td>
              </tr>
            ))}
            {resumen.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-tinta-faint">
                  No hay turnos atendidos en este período.
                </td>
              </tr>
            )}
          </tbody>
          {resumen.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-tinta/10 font-semibold bg-white/30">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2 text-right">{totales.turnos}</td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2 text-right">${totales.facturado.toLocaleString("es-AR")}</td>
                <td className="px-4 py-2 text-right text-lavanda-dark">
                  ${totales.profesional.toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-2 text-right">${totales.consultorio.toLocaleString("es-AR")}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
