import type { Consultorio, Disciplina, Profesional, Sesion, Turno } from "./types";

// ---------------------------------------------------------------------
// Prompt de sistema de "Clave", el asistente de Espacio Clave.
// Se arma en dos partes: la personalidad/reglas (fija) y el contexto
// de datos reales (dinámico, se reconstruye en cada request).
// ---------------------------------------------------------------------

const PERSONALIDAD = `Sos "Clave", el asistente de inteligencia artificial de Espacio Clave, un centro
de salud y educación con 8 consultorios donde atienden profesionales de
Educación, Osteopatía, Kinesiología, Psicología y Psicopedagogía.

Hablás con el equipo administrativo (recepción/administración) y con los
profesionales que atienden en el centro — NUNCA con pacientes directamente.

TU PERSONALIDAD
- Cálido, empático y cercano, pero siempre profesional: nada de informalidad
  excesiva ni emojis de más. Un saludo amable alcanza.
- Servicial y resolutivo: si te piden un dato de la agenda, lo das directo;
  si te piden ayuda con un cálculo, lo resolvés mostrando cómo llegaste
  al resultado.
- Tenés buen criterio en salud, educación, contabilidad y matemática
  aplicada al día a día de un consultorio (cálculo de honorarios,
  porcentajes, cierres mensuales, ocupación, facturación).
- Mantenés el contexto de toda la conversación: si te preguntan algo que
  hace referencia a un mensaje anterior, lo recordás.

REGLAS QUE NUNCA ROMPÉS
1. Nunca inventés turnos, pacientes, profesionales ni montos que no estén
   en el "CONTEXTO DE DATOS" de abajo. Si no tenés el dato, decilo con
   naturalidad y sugerí dónde puede buscarlo (calendario, cierre mensual, etc).
2. No das diagnósticos clínicos, indicaciones terapéuticas ni consejos
   psicológicos/médicos sobre pacientes puntuales — para eso está cada
   profesional. Podés ayudar con la parte organizativa, administrativa y
   de cálculo, no con el contenido clínico de un tratamiento.
3. Los datos de pacientes son sensibles: si quien te escribe es un
   profesional, mostrale solo información de SUS pacientes y SU agenda,
   nunca la de otros profesionales.
4. Si te preguntan algo totalmente ajeno a Espacio Clave (charla general),
   podés responder con amabilidad pero redirigí suave hacia en qué podés
   ayudar dentro del consultorio.
5. Respuestas breves y claras por default (2-5 líneas). Si el tema
   amerita un desarrollo más largo (una explicación de cálculo, por
   ejemplo), extendete lo necesario pero de forma ordenada.
6. Si te saludan, saludá con calidez y preguntá en qué podés ayudar —
   sin repetir un speech largo de presentación en cada mensaje, solo la
   primera vez o cuando tenga sentido.`;

function formatearHora(hora: string) {
  return hora?.slice(0, 5) || hora;
}

export function buildContextoDatos({
  sesion,
  hoy,
  turnos,
  profesionales,
  consultorios,
  disciplinas,
}: {
  sesion: Sesion;
  hoy: Date;
  turnos: Turno[];
  profesionales: Profesional[];
  consultorios: Consultorio[];
  disciplinas: Disciplina[];
}) {
  const fechaHoy = hoy.toISOString().slice(0, 10);
  const fechaLegible = hoy.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lineas: string[] = [];
  lineas.push(`Fecha y hora actual: ${fechaLegible} (${fechaHoy}).`);
  lineas.push(
    sesion.tipo === "admin"
      ? `Quien te escribe es del equipo de administración/recepción (usuario: ${sesion.nombre}). Tiene visibilidad de todo el centro.`
      : `Quien te escribe es el/la profesional ${sesion.nombre}. Solo mostrale información de su propia agenda.`
  );

  lineas.push(`\nCONSULTORIOS (${consultorios.length}): ` + consultorios.map((c) => c.nombre).join(", "));
  lineas.push(`DISCIPLINAS: ` + disciplinas.map((d) => d.nombre).join(", "));

  if (sesion.tipo === "admin") {
    lineas.push(`\nPROFESIONALES DEL CENTRO:`);
    profesionales.forEach((p) => {
      const disc = disciplinas.find((d) => d.id === p.disciplina_id)?.nombre || "—";
      const consultorioFijo = consultorios.find((c) => c.id === p.consultorio_fijo_id)?.nombre;
      const modalidad = p.modalidad_facturacion || "porcentaje";
      const partecontable =
        modalidad === "modulo"
          ? `modalidad módulo: $${Number(p.valor_modulo_consultorio).toLocaleString("es-AR")} consultorio por módulo, el resto le queda automático al profesional`
          : modalidad === "bloque"
          ? `modalidad bloque: $${Number(p.valor_bloque_consultorio).toLocaleString("es-AR")} por bloque para el consultorio`
          : `modalidad porcentaje: ${p.porcentaje_profesional}% para el profesional · precio de consulta: $${Number(p.precio_consulta).toLocaleString("es-AR")}`;
      lineas.push(
        `- ${p.nombre} · ${disc} · consultorio: ${consultorioFijo || "rota entre consultorios"} · ` +
          `${partecontable} · ${p.activo ? "activo" : "inactivo"}`
      );
    });
  }

  const turnosOrdenados = [...turnos].sort((a, b) =>
    `${a.fecha}${a.hora_inicio}`.localeCompare(`${b.fecha}${b.hora_inicio}`)
  );

  lineas.push(
    `\nTURNOS (${sesion.tipo === "admin" ? "todos los profesionales" : "solo los de " + sesion.nombre}, próximos ${turnosOrdenados.length} registros desde hoy):`
  );
  if (turnosOrdenados.length === 0) {
    lineas.push("No hay turnos cargados en este rango.");
  }
  turnosOrdenados.slice(0, 60).forEach((t) => {
    const prof = profesionales.find((p) => p.id === t.profesional_id);
    const disc = disciplinas.find((d) => d.id === t.disciplina_id)?.nombre || "—";
    const consultorio = consultorios.find((c) => c.id === t.consultorio_id)?.nombre || `#${t.consultorio_id}`;
    lineas.push(
      `- ${t.fecha} ${formatearHora(t.hora_inicio)} · ${prof?.nombre || "?"} (${disc}) · ${consultorio} · ` +
        `paciente: ${t.paciente_nombre || "sin nombre"} · estado: ${t.estado} · $${Number(t.precio).toLocaleString("es-AR")}`
    );
  });

  return lineas.join("\n");
}

export function buildSystemPrompt(contextoDatos: string) {
  return `${PERSONALIDAD}\n\n---\nCONTEXTO DE DATOS (información real y actualizada de Espacio Clave, generada en este momento):\n${contextoDatos}\n---\n\nUsá este contexto para responder. Si te preguntan algo que no está acá, decilo con transparencia.`;
}
