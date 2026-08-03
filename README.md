# Espacio Clave — Sistema de agenda y administración

Demo funcional para un consultorio interdisciplinario (Educación, Osteopatía,
Kinesiología, Psicología, Psicopedagogía) con 8 consultorios físicos.

Stack: **Next.js 14 (App Router)** + **Supabase** (base de datos) + **Vercel** (hosting).

## Qué incluye esta demo

- Dashboard de administración con calendario en 3 vistas: **Semana**, **Mes** y
  **Uso de consultorios** (para ver qué consultorio está libre/ocupado y cuándo).
- Filtros por disciplina y por consultorio.
- Alta de turnos: paciente, profesional, consultorio, día, horario y precio.
- Login de profesionales (usuario/contraseña que carga el admin a mano — ver
  sección "Login" más abajo) donde cada uno ve **solo su propia agenda**.
- Cierre mensual: calcula automáticamente cuánto corresponde a cada
  profesional y cuánto al consultorio, según el % que le hayas configurado a
  cada uno.
- Base de datos preparada para que, más adelante, los pacientes puedan sacar
  turno solos (la tabla `turnos` ya tiene un campo `origen` que distingue
  turnos creados por admin, por el profesional o por el propio paciente).

## 1. Crear el proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. En **SQL Editor**, pegá y ejecutá el contenido de `supabase/schema.sql`.
   Esto crea todas las tablas y carga los 8 consultorios y las 5 disciplinas.
3. En **Project Settings → API** copiá:
   - `Project URL` → va en `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → va en `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no se usa
     todavía en esta demo, pero la dejamos lista para cuando sumemos el
     acceso de pacientes)
   - `service_role key` → va en `SUPABASE_SERVICE_ROLE_KEY` (¡mantenela
     secreta, nunca la subas a git ni la expongas al navegador!)

## 2. Configurar variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SESSION_SECRET=un-string-largo-y-random

# Usuario y contraseña del panel de administración
ADMIN_USUARIO=admin
ADMIN_PASSWORD=elegí-una-contraseña-segura
```

## 3. Cargar profesionales

Por ahora, el login de cada profesional se resuelve contra la tabla
`profesionales` (columnas `usuario` y `password`). Para cargarlos:

- Entrá al dashboard como admin (`/login`) y andá a **Profesionales → Agregar
  profesional**. Ahí definís nombre, disciplina, consultorio fijo (o "rota"),
  el % que le corresponde y su usuario/contraseña de acceso.

> Nota: en esta etapa demo la contraseña se guarda en texto plano en la base,
> algo aceptable para un piloto interno, pero **antes de pasar a producción
> real** conviene migrar el login de profesionales a **Supabase Auth**
> (magic link o email + contraseña con hash). Cuando quieran dar ese paso,
> conviene retomarlo — la estructura de roles ya está pensada para eso.

## 4. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) — te redirige a `/login`.

## 5. Subir a GitHub

```bash
git init
git add .
git commit -m "Espacio Clave - demo inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/espacio-clave.git
git push -u origin main
```

(`.env.local` no se sube porque está en `.gitignore` — las variables se
cargan directamente en Vercel).

## 6. Deploy en Vercel

1. En [vercel.com](https://vercel.com), **Add New → Project** y elegí el
   repo de GitHub.
2. En **Environment Variables** cargá las mismas variables del paso 2
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `ADMIN_USUARIO`,
   `ADMIN_PASSWORD`).
3. Deploy. Vercel detecta Next.js automáticamente, no hace falta configurar
   nada más.

## Próximos pasos sugeridos (cuando quieran seguir)

- **Turnos de pacientes online**: habilitar un formulario público que inserte
  en `turnos` con `origen = 'paciente'`, con reglas de disponibilidad
  (RLS en Supabase) para que un paciente no pueda ver ni tocar turnos ajenos.
- **Notificaciones**: recordatorios por WhatsApp/email antes del turno.
- **Reportes**: exportar el cierre mensual a PDF o Excel.
- **App nativa**: reutilizar toda la lógica de Supabase (tablas, API) desde
  una app en React Native/Expo, cuando decidan dar ese paso.
- **Auth real** para profesionales (Supabase Auth) en lugar del login manual
  actual, ideal antes de tener muchos usuarios o de habilitar el acceso de
  pacientes.

## Estructura del proyecto

```
espacio-clave/
├── supabase/schema.sql       # esquema completo + seed de consultorios/disciplinas
├── app/
│   ├── login/                 # login único (admin y profesionales)
│   ├── admin/                 # panel de administración
│   │   ├── calendario/        # semana / mes / uso de consultorios
│   │   ├── profesionales/     # alta y listado de profesionales
│   │   └── cierre/            # cierre mensual
│   ├── profesional/           # agenda personal de cada profesional
│   └── api/                   # rutas de datos (turnos, cierre, login, etc.)
├── components/                 # calendario, modal de turno, filtros
├── lib/                        # tipos, cálculo de cierre, fechas, sesión
└── middleware.ts               # protege /admin y /profesional
```
