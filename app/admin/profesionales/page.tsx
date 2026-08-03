"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import type { Consultorio, Disciplina, Profesional } from "@/lib/types";
import ProfesionalModal from "@/components/ProfesionalModal";

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);

  async function cargar() {
    const [r1, r2] = await Promise.all([fetch("/api/profesionales"), fetch("/api/referencia")]);
    const d1 = await r1.json();
    const d2 = await r2.json();
    setProfesionales(d1.profesionales || []);
    setDisciplinas(d2.disciplinas || []);
    setConsultorios(d2.consultorios || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEdicion(p: Profesional) {
    setEditando(p);
    setModalAbierto(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-tinta mb-1">Profesionales</h1>
          <p className="text-tinta-soft text-sm">
            Disciplina, consultorio, % de reparto y credenciales de acceso.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl2 bg-gradiente-marca text-white shadow-glow-coral hover:opacity-95 active:scale-[0.98] transition"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Agregar profesional
        </button>
      </div>

      <div className="ec-glass rounded-xl3 shadow-glass overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/30 text-tinta-faint text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Disciplina</th>
              <th className="text-left px-4 py-2">Consultorio fijo</th>
              <th className="text-left px-4 py-2">Modalidad</th>
              <th className="text-left px-4 py-2">Valores</th>
              <th className="text-left px-4 py-2">Usuario</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profesionales.map((p) => (
              <tr key={p.id} className="border-t border-white/40 hover:bg-white/30 transition-colors">
                <td className="px-4 py-2 font-medium text-tinta">{p.nombre}</td>
                <td className="px-4 py-2">{disciplinas.find((d) => d.id === p.disciplina_id)?.nombre}</td>
                <td className="px-4 py-2">
                  {consultorios.find((c) => c.id === p.consultorio_fijo_id)?.nombre || "Rota"}
                </td>
                <td className="px-4 py-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-lavanda/15 text-lavanda-dark">
                    {p.modalidad_facturacion === "modulo"
                      ? "Módulo"
                      : p.modalidad_facturacion === "bloque"
                      ? "Bloque"
                      : "Porcentaje"}
                  </span>
                </td>
                <td className="px-4 py-2 text-tinta-soft text-xs leading-relaxed">
                  {p.modalidad_facturacion === "modulo" ? (
                    <>
                      <span className="block">${Number(p.valor_modulo_consultorio).toLocaleString("es-AR")} consultorio / módulo</span>
                      <span className="block text-tinta-faint">resto automático al profesional</span>
                    </>
                  ) : p.modalidad_facturacion === "bloque" ? (
                    <span className="block">${Number(p.valor_bloque_consultorio).toLocaleString("es-AR")} / bloque</span>
                  ) : (
                    <>
                      <span className="block">{p.porcentaje_profesional}% profesional</span>
                      <span className="block text-tinta-faint">${Number(p.precio_consulta).toLocaleString("es-AR")} consulta</span>
                    </>
                  )}
                </td>
                <td className="px-4 py-2">{p.usuario}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.activo ? "bg-verde-soft text-verde-dark" : "bg-tinta-faint/15 text-tinta-faint"
                    }`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => abrirEdicion(p)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-lavanda hover:text-lavanda-dark transition"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {profesionales.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-tinta-faint">
                  Todavía no hay profesionales cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProfesionalModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={cargar}
        disciplinas={disciplinas}
        consultorios={consultorios}
        profesionalExistente={editando}
      />
    </div>
  );
}
