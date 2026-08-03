-- =========================================================
-- ESPACIO CLAVE - Schema inicial (demo)
-- Ejecutar en el SQL Editor de Supabase, en orden.
-- =========================================================

-- ---------- CONSULTORIOS ----------
create table if not exists consultorios (
  id serial primary key,
  nombre text not null,          -- "Consultorio 1", "Consultorio 2", ...
  activo boolean not null default true
);

-- ---------- DISCIPLINAS ----------
create table if not exists disciplinas (
  id serial primary key,
  nombre text not null unique,   -- Educación, Osteopatía, Kinesiología, Psicología, Psicopedagogía
  color text not null default '#4C7C90' -- color hex para el calendario
);

-- ---------- PROFESIONALES ----------
create table if not exists profesionales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  disciplina_id int not null references disciplinas(id),
  -- consultorio fijo (nullable = rota entre consultorios segun disponibilidad)
  consultorio_fijo_id int references consultorios(id),
  -- modalidad de facturación del profesional: como se reparte lo que
  -- se cobra entre el consultorio y el profesional
  --   'porcentaje' -> % profesional / % consultorio sobre precio_consulta
  --   'modulo'     -> cada turno (45' o 1h) vale un monto fijo para c/u
  --   'bloque'     -> el consultorio cobra un monto fijo por bloque de
  --                   horas trabajado (ej. 4hs); lo que cobra el
  --                   profesional a sus pacientes queda afuera del cierre
  modalidad_facturacion text not null default 'porcentaje'
    check (modalidad_facturacion in ('porcentaje', 'modulo', 'bloque')),
  -- porcentaje que le corresponde al profesional por cada consulta (0-100)
  -- [modalidad 'porcentaje']
  porcentaje_profesional numeric(5,2) not null default 60.00,
  -- precio por defecto de su consulta, lo que paga el paciente
  -- [modalidad 'porcentaje' y 'modulo'] (se puede pisar por turno)
  precio_consulta numeric(10,2) not null default 0,
  -- cobro fijo por módulo (turno) para el consultorio y para el profesional
  -- [modalidad 'modulo']
  valor_modulo_consultorio numeric(10,2) not null default 0,
  valor_modulo_profesional numeric(10,2) not null default 0,
  -- cobro fijo del consultorio por cada bloque de horas trabajado
  -- [modalidad 'bloque']; un bloque = un día con al menos un turno atendido
  valor_bloque_consultorio numeric(10,2) not null default 0,
  activo boolean not null default true,
  -- credenciales simples para el login "manual" de la etapa demo
  usuario text unique not null,
  password text not null, -- demo: texto plano / mas adelante hashear o migrar a Supabase Auth
  creado_en timestamptz not null default now()
);

-- ---------- PACIENTES ----------
create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  obra_social text,
  notas text,
  creado_en timestamptz not null default now()
);

-- ---------- TURNOS ----------
create table if not exists turnos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id),
  paciente_nombre text,               -- por si aun no esta cargado como paciente formal
  profesional_id uuid not null references profesionales(id),
  disciplina_id int not null references disciplinas(id),
  consultorio_id int not null references consultorios(id),
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  precio numeric(10,2) not null default 0,
  estado text not null default 'reservado'
    check (estado in ('reservado','confirmado','atendido','cancelado','ausente')),
  origen text not null default 'admin'
    check (origen in ('admin','profesional','paciente')), -- 'paciente' se habilita a futuro
  notas text,
  creado_en timestamptz not null default now(),
  -- evita doble reserva del mismo consultorio en el mismo horario
  constraint turno_sin_solape unique (consultorio_id, fecha, hora_inicio)
);

create index if not exists idx_turnos_fecha on turnos(fecha);
create index if not exists idx_turnos_profesional on turnos(profesional_id);
create index if not exists idx_turnos_consultorio on turnos(consultorio_id, fecha);

-- ---------- CIERRES MENSUALES (snapshot calculado) ----------
create table if not exists cierres_mensuales (
  id uuid primary key default gen_random_uuid(),
  anio int not null,
  mes int not null, -- 1-12
  profesional_id uuid not null references profesionales(id),
  modalidad_facturacion text,
  cantidad_turnos int not null default 0,
  cantidad_bloques int not null default 0,
  total_facturado numeric(12,2) not null default 0,
  total_profesional numeric(12,2) not null default 0,
  total_consultorio numeric(12,2) not null default 0,
  generado_en timestamptz not null default now(),
  unique (anio, mes, profesional_id)
);

-- =========================================================
-- SEED: 8 consultorios y 5 disciplinas
-- =========================================================
insert into consultorios (nombre) values
  ('Consultorio 1'),('Consultorio 2'),('Consultorio 3'),('Consultorio 4'),
  ('Consultorio 5'),('Consultorio 6'),('Consultorio 7'),('Consultorio 8')
on conflict do nothing;

insert into disciplinas (nombre, color) values
  ('Educación', '#4D9DE0'),
  ('Osteopatía', '#C08A5C'),
  ('Kinesiología', '#4FAFA8'),
  ('Psicología', '#9C6ADE'),
  ('Psicopedagogía', '#E08A9B')
on conflict (nombre) do nothing;

-- =========================================================
-- RLS: por ahora las tablas se consultan solo desde el
-- servidor (API routes) con la Service Role Key, así que
-- dejamos RLS activado y SIN policies publicas.
-- Cuando pasemos a Supabase Auth para profesionales/pacientes,
-- se agregan policies especificas por rol.
-- =========================================================
alter table consultorios enable row level security;
alter table disciplinas enable row level security;
alter table profesionales enable row level security;
alter table pacientes enable row level security;
alter table turnos enable row level security;
alter table cierres_mensuales enable row level security;
