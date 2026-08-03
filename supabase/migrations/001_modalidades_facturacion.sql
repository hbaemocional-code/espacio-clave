-- =========================================================
-- Migración: 3 modalidades de facturación para profesionales
-- Ejecutar UNA VEZ en el SQL Editor de Supabase.
-- Es seguro correrla aunque ya existan las columnas (usa IF NOT EXISTS).
-- =========================================================

alter table profesionales
  add column if not exists modalidad_facturacion text not null default 'porcentaje';

-- El check constraint no soporta "if not exists" directo, así que lo
-- recreamos sin romper si ya existía.
alter table profesionales
  drop constraint if exists profesionales_modalidad_facturacion_check;
alter table profesionales
  add constraint profesionales_modalidad_facturacion_check
  check (modalidad_facturacion in ('porcentaje', 'modulo', 'bloque'));

alter table profesionales
  add column if not exists valor_modulo_consultorio numeric(10,2) not null default 0;
alter table profesionales
  add column if not exists valor_modulo_profesional numeric(10,2) not null default 0;
alter table profesionales
  add column if not exists valor_bloque_consultorio numeric(10,2) not null default 0;

-- Todos los profesionales existentes quedan con modalidad 'porcentaje'
-- (la que ya usaban), así que no hace falta tocar sus datos actuales.

-- ---------- CIERRES MENSUALES: guardamos también la modalidad y,
-- para la modalidad 'bloque', la cantidad de bloques trabajados ----------
alter table cierres_mensuales
  add column if not exists modalidad_facturacion text;
alter table cierres_mensuales
  add column if not exists cantidad_bloques int not null default 0;

-- ---------- AJUSTE MANUAL DEL COBRO PROFESIONAL POR TURNO ----------
-- Solo aplica a la modalidad "modulo": por defecto el cobro del
-- profesional sale automático (precio del turno - cobro fijo del
-- consultorio). Si algún turno tuvo otro arreglo, se puede pisar acá.
alter table turnos
  add column if not exists cobro_profesional_manual numeric(10,2);
