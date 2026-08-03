"use client";

import type { Disciplina, Turno } from "@/lib/types";

// Colores fijos por estado — más importantes que el color de disciplina
// para que de un vistazo se sepa quién vino, quién faltó y quién canceló.
const VERDE = "#3E9B6F";
const VERDE_BG = "#E7F5EE";
const ROJO = "#D64545";
const ROJO_BG = "#FBEAEA";

function estiloPorEstado(estado: Turno["estado"], colorDisciplina: string) {
  switch (estado) {
    case "atendido":
      return {
        bg: VERDE_BG,
        borde: VERDE,
        texto: VERDE,
        clases: "",
      };
    case "ausente":
      return {
        bg: ROJO_BG,
        borde: ROJO,
        texto: ROJO,
        clases: "",
      };
    case "cancelado":
      return {
        bg: "#F1EFEC",
        borde: "#B8B2A8",
        texto: "#8A8478",
        clases: "line-through decoration-2 opacity-70",
      };
    default:
      // reservado / confirmado -> color de la disciplina
      return {
        bg: `${colorDisciplina}1F`,
        borde: colorDisciplina,
        texto: colorDisciplina,
        clases: "",
      };
  }
}

export default function TurnoChip({
  turno,
  disciplina,
  onClick,
  detalle,
}: {
  turno: Turno;
  disciplina?: Disciplina;
  onClick: () => void;
  detalle?: string;
}) {
  const colorDisciplina = disciplina?.color || "#9C6ADE";
  const estilo = estiloPorEstado(turno.estado, colorDisciplina);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg pl-2.5 pr-2 py-1.5 text-[13px] leading-tight truncate transition hover:brightness-95 ${estilo.clases}`}
      style={{ backgroundColor: estilo.bg, borderLeft: `3px solid ${estilo.borde}` }}
      title={`${turno.paciente_nombre || "Sin nombre"} · ${turno.hora_inicio.slice(0, 5)} · ${turno.estado}`}
    >
      <span className="font-bold" style={{ color: estilo.texto }}>
        {turno.hora_inicio.slice(0, 5)}
      </span>{" "}
      <span className="font-semibold text-tinta">{turno.paciente_nombre || "Paciente"}</span>
      {detalle ? <span className="text-tinta-faint font-normal"> · {detalle}</span> : null}
    </button>
  );
}
