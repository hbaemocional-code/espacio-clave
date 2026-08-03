import type { Turno, Profesional, ModalidadFacturacion } from "./types";

export type ResumenProfesional = {
  profesionalId: string;
  nombre: string;
  modalidad: ModalidadFacturacion;
  cantidadTurnos: number;
  // Solo tiene sentido en modalidad "bloque": cantidad de días distintos
  // con al menos un turno atendido.
  cantidadBloques: number;
  // Suma de lo que pagaron los pacientes (turno.precio). En modalidad
  // "bloque" es puramente informativo: no forma parte de lo que se le
  // cobra al consultorio.
  totalFacturado: number;
  totalProfesional: number;
  totalConsultorio: number;
  // Cantidad de turnos donde el cobro del profesional fue corregido a
  // mano (solo aplica en modalidad "modulo").
  cantidadAjustesManual: number;
};

// Solo se cobran los turnos "atendido". Los cancelados/ausentes no facturan.
//
// Cada profesional tiene una modalidad de facturación propia:
//  - "porcentaje": el profesional se queda con un % del precio de cada
//    consulta; el resto queda para el consultorio.
//  - "modulo": cada turno atendido (dure 45' o 1h, no importa) tiene un
//    cobro fijo para el consultorio; lo que le queda al profesional sale
//    automático (precio del turno - ese fijo), salvo que el turno tenga
//    un ajuste manual cargado (otro arreglo puntual), en cuyo caso se usa
//    ese valor y queda marcado como corregido a mano.
//  - "bloque": el consultorio cobra un monto fijo por cada bloque de horas
//    trabajado (se cuenta como 1 bloque por cada día distinto en el que el
//    profesional tuvo al menos un turno atendido). Lo que el profesional le
//    cobra a sus pacientes no le corresponde al consultorio, así que solo
//    se muestra como referencia.
export function calcularCierreMensual(
  turnos: Turno[],
  profesionales: Profesional[]
): ResumenProfesional[] {
  const porProfesional = new Map<string, ResumenProfesional>();
  const diasTrabajadosPorProfesional = new Map<string, Set<string>>();

  for (const prof of profesionales) {
    porProfesional.set(prof.id, {
      profesionalId: prof.id,
      nombre: prof.nombre,
      modalidad: prof.modalidad_facturacion || "porcentaje",
      cantidadTurnos: 0,
      cantidadBloques: 0,
      totalFacturado: 0,
      totalProfesional: 0,
      totalConsultorio: 0,
      cantidadAjustesManual: 0,
    });
    diasTrabajadosPorProfesional.set(prof.id, new Set());
  }

  for (const turno of turnos) {
    if (turno.estado !== "atendido") continue;
    const prof = profesionales.find((p) => p.id === turno.profesional_id);
    if (!prof) continue;

    const resumen = porProfesional.get(prof.id)!;
    const precio = Number(turno.precio) || 0;
    const modalidad = prof.modalidad_facturacion || "porcentaje";

    resumen.cantidadTurnos += 1;
    resumen.totalFacturado = round2(resumen.totalFacturado + precio);

    if (modalidad === "porcentaje") {
      const pctProfesional = Number(prof.porcentaje_profesional) || 0;
      const partProfesional = round2((precio * pctProfesional) / 100);
      const partConsultorio = round2(precio - partProfesional);
      resumen.totalProfesional = round2(resumen.totalProfesional + partProfesional);
      resumen.totalConsultorio = round2(resumen.totalConsultorio + partConsultorio);
    } else if (modalidad === "modulo") {
      const valorConsultorio = Number(prof.valor_modulo_consultorio) || 0;
      const tieneAjusteManual =
        turno.cobro_profesional_manual !== null && turno.cobro_profesional_manual !== undefined;
      const valorProfesional = tieneAjusteManual
        ? Number(turno.cobro_profesional_manual)
        : round2(precio - valorConsultorio);
      if (tieneAjusteManual) resumen.cantidadAjustesManual += 1;
      resumen.totalProfesional = round2(resumen.totalProfesional + valorProfesional);
      resumen.totalConsultorio = round2(resumen.totalConsultorio + valorConsultorio);
    } else if (modalidad === "bloque") {
      // El precio que pagó el paciente queda solo en totalFacturado, como
      // referencia: no es ingreso del consultorio en esta modalidad.
      diasTrabajadosPorProfesional.get(prof.id)!.add(turno.fecha);
    }
  }

  // Cierre de la modalidad "bloque": 1 bloque por cada día distinto
  // trabajado, valorizado al monto fijo que cobra el consultorio.
  for (const prof of profesionales) {
    if ((prof.modalidad_facturacion || "porcentaje") !== "bloque") continue;
    const resumen = porProfesional.get(prof.id)!;
    const dias = diasTrabajadosPorProfesional.get(prof.id)!;
    const valorBloque = Number(prof.valor_bloque_consultorio) || 0;
    resumen.cantidadBloques = dias.size;
    resumen.totalConsultorio = round2(dias.size * valorBloque);
    // totalProfesional queda en 0: lo que cobra a sus pacientes no pasa
    // por la caja del consultorio en esta modalidad.
  }

  return Array.from(porProfesional.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
