export type Disciplina = {
  id: number;
  nombre: string;
  color: string;
};

export type Consultorio = {
  id: number;
  nombre: string;
  activo: boolean;
};

export type ModalidadFacturacion = "porcentaje" | "modulo" | "bloque";

export type Profesional = {
  id: string;
  nombre: string;
  disciplina_id: number;
  consultorio_fijo_id: number | null;
  modalidad_facturacion: ModalidadFacturacion;
  // modalidad "porcentaje"
  porcentaje_profesional: number;
  // modalidad "porcentaje" y "modulo" (lo que paga el paciente)
  precio_consulta: number;
  // modalidad "modulo": cobro fijo del consultorio por módulo; lo que le
  // queda al profesional sale automático (precio - este valor)
  valor_modulo_consultorio: number;
  // modalidad "bloque"
  valor_bloque_consultorio: number;
  activo: boolean;
  usuario: string;
};

export type EstadoTurno = "reservado" | "confirmado" | "atendido" | "cancelado" | "ausente";

export type Turno = {
  id: string;
  paciente_id: string | null;
  paciente_nombre: string | null;
  profesional_id: string;
  disciplina_id: number;
  consultorio_id: number;
  fecha: string; // yyyy-mm-dd
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
  precio: number;
  // Solo modalidad "modulo": si tiene valor, pisa el cálculo automático
  // (precio - cobro fijo del consultorio) para ESE turno puntual.
  cobro_profesional_manual: number | null;
  estado: EstadoTurno;
  origen: "admin" | "profesional" | "paciente";
  notas: string | null;
};

export type Sesion = {
  tipo: "admin" | "profesional";
  profesionalId?: string;
  nombre: string;
};
