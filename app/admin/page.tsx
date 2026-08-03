"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { addDays } from "date-fns";
import { CalendarClock, Sparkles } from "lucide-react";
import type { Consultorio, Disciplina, Profesional, Turno } from "@/lib/types";
import { aISO, diasDeSemana } from "@/lib/dates";
import VistaSemana from "@/components/VistaSemana";
import TurnoModal from "@/components/TurnoModal";

function Sparkline({ valores, color }: { valores: number[]; color: string }) {
  const max = Math.max(...valores, 1);
  const puntos = valores
    .map((v, i) => `${(i / Math.max(valores.length - 1, 1)) * 100},${28 - (v / max) * 26}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8 mt-1" preserveAspectRatio="none">
      <polyline points={puntos} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [turnosSemana, setTurnosSemana] = useState<Turno[]>([]);
  const [turnosProximos, setTurnosProximos] = useState<Turno[]>([]);
  const [facturacionMes, setFacturacionMes] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);

  const hoy = new Date();
  const dias = diasDeSemana(hoy);

  useEffect(() => {
    fetch("/api/referencia")
      .then((r) => r.json())
      .then((d) => {
        setConsultorios(d.consultorios || []);
        setDisciplinas(d.disciplinas || []);
      });
    fetch("/api/profesionales")
      .then((r) => r.json())
      .then((d) => setProfesionales(d.profesionales || []));

    const desdeSemana = aISO(dias[0]);
    const hastaSemana = aISO(dias[dias.length - 1]);
    fetch(`/api/turnos?desde=${desdeSemana}&hasta=${hastaSemana}`)
      .then((r) => r.json())
      .then((d) => setTurnosSemana(d.turnos || []));

    fetch(`/api/turnos?desde=${aISO(hoy)}&hasta=${aISO(addDays(hoy, 13))}`)
      .then((r) => r.json())
      .then((d) => setTurnosProximos(d.turnos || []));

    const desdeMes = aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    const hastaMes = aISO(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
    fetch(`/api/turnos?desde=${desdeMes}&hasta=${hastaMes}`)
      .then((r) => r.json())
      .then((d) => {
        const total = (d.turnos || [])
          .filter((t: Turno) => t.estado === "atendido")
          .reduce((acc: number, t: Turno) => acc + Number(t.precio), 0);
        setFacturacionMes(total);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const turnosHoyISO = aISO(hoy);
  const turnosHoy = turnosSemana.filter((t) => t.fecha === turnosHoyISO && t.estado !== "cancelado");
  const pacientesActivos = new Set(
    turnosSemana.filter((t) => t.paciente_nombre).map((t) => t.paciente_nombre)
  ).size;

  const proximos = useMemo(() => {
    const ahora = hoy.getTime();
    return turnosProximos
      .filter((t) => t.estado !== "cancelado")
      .filter((t) => new Date(`${t.fecha}T${t.hora_inicio}`).getTime() >= ahora - 1000 * 60 * 60)
      .sort(
        (a, b) =>
          new Date(`${a.fecha}T${a.hora_inicio}`).getTime() -
          new Date(`${b.fecha}T${b.hora_inicio}`).getTime()
      )
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnosProximos]);

  const consultoriosOcupadosHoy = new Set(turnosHoy.map((t) => t.consultorio_id));

  const porDia = dias.map((d) => {
    const iso = aISO(d);
    return turnosSemana.filter((t) => t.fecha === iso && t.estado !== "cancelado").length;
  });
  const cancelacionesSemana = turnosSemana.filter((t) => t.estado === "cancelado").length;
  const ingresosSemana = turnosSemana
    .filter((t) => t.estado === "atendido")
    .reduce((acc, t) => acc + Number(t.precio), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl text-tinta mb-0.5">
          ¡Buenos días! <span className="inline-block">👋</span>
        </h1>
        <p className="text-tinta-soft text-sm capitalize">
          {hoy.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        <TarjetaStat label="Turnos hoy" valor={turnosHoy.length} color="coral" />
        <TarjetaStat label="Profesionales activos" valor={profesionales.filter((p) => p.activo).length} color="lavanda" />
        <TarjetaStat label="Consultorios" valor={consultorios.length} color="naranja" sub={`${consultoriosOcupadosHoy.size} en uso hoy`} />
        <TarjetaStat label="Pacientes esta semana" valor={pacientesActivos} color="verde" />
        <TarjetaStat label="Facturación (mes)" valor={`$${facturacionMes.toLocaleString("es-AR")}`} color="coral" />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-tinta">Calendario semanal</h2>
            <Link href="/admin/calendario" className="text-sm font-medium text-lavanda hover:text-lavanda-dark transition">
              Ver calendario completo →
            </Link>
          </div>
          <VistaSemana
            fechaBase={hoy}
            turnos={turnosSemana}
            disciplinas={disciplinas}
            onSlotVacio={() => setModalAbierto(true)}
            onTurno={() => setModalAbierto(true)}
          />

          <div className="grid grid-cols-4 gap-3 mt-5">
            <TarjetaMini label="Turnos por día" valor={turnosSemana.filter((t) => t.estado !== "cancelado").length} color="#9C6ADE" serie={porDia} />
            <TarjetaMini label="Pacientes" valor={pacientesActivos} color="#4FAFA8" serie={porDia.map((v) => Math.max(0, v - 1))} />
            <TarjetaMini label="Cancelaciones" valor={cancelacionesSemana} color="#F46B6B" serie={porDia.map(() => cancelacionesSemana)} />
            <TarjetaMini label="Ingresos" valor={`$${ingresosSemana.toLocaleString("es-AR")}`} color="#F6A04D" serie={porDia} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="ec-glass rounded-xl3 shadow-glass p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-tinta">Próximos turnos</h3>
              <Link href="/admin/calendario" className="text-xs font-medium text-lavanda hover:text-lavanda-dark">
                Ver agenda
              </Link>
            </div>
            <div className="space-y-2.5">
              {proximos.length === 0 && (
                <p className="text-xs text-tinta-faint py-4 text-center">Sin turnos próximos.</p>
              )}
              {proximos.map((t) => {
                const disc = disciplinas.find((d) => d.id === t.disciplina_id);
                const prof = profesionales.find((p) => p.id === t.profesional_id);
                return (
                  <div key={t.id} className="pl-2.5" style={{ borderLeft: `2.5px solid ${disc?.color || "#9C6ADE"}` }}>
                    <p className="text-xs font-semibold text-tinta">
                      {t.hora_inicio.slice(0, 5)} · {prof?.nombre || "Profesional"}
                    </p>
                    <p className="text-[11px] text-tinta-faint truncate">
                      {disc?.nombre} · {consultorios.find((c) => c.id === t.consultorio_id)?.nombre || `Consultorio ${t.consultorio_id}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ec-glass rounded-xl3 shadow-glass p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-tinta">Estado de consultorios</h3>
              <Link href="/admin/calendario" className="text-xs font-medium text-lavanda hover:text-lavanda-dark">
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {consultorios.map((c) => {
                const ocupado = consultoriosOcupadosHoy.has(c.id);
                return (
                  <div
                    key={c.id}
                    className={`rounded-xl2 py-2.5 text-center ${
                      ocupado ? "bg-coral-soft text-coral-dark" : "bg-verde-soft text-verde-dark"
                    }`}
                  >
                    <p className="text-[11px] font-semibold">{c.nombre.replace("Consultorio ", "C")}</p>
                    <p className="text-[10px] opacity-80">{ocupado ? "Ocupado" : "Libre"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradiente-asistente rounded-xl3 shadow-glass p-4 flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-white/60">
              <Image src="/brand/clave-mascota.png" alt="Clave" width={56} height={56} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-display font-bold text-tinta mb-0.5">
                Asistente Clave <Sparkles className="w-3.5 h-3.5 text-coral" strokeWidth={2} />
              </p>
              <p className="text-xs text-tinta-soft mb-2.5">
                {consultorios.length - consultoriosOcupadosHoy.size} consultorios libres hoy. ¿Querés completarlos?
              </p>
              <Link
                href="/admin/calendario"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradiente-marca text-white px-3.5 py-1.5 rounded-xl2 shadow-glow-coral hover:opacity-95 transition"
              >
                <CalendarClock className="w-3.5 h-3.5" strokeWidth={2.2} />
                Agendar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TurnoModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={() => {}}
        profesionales={profesionales}
        disciplinas={disciplinas}
        consultorios={consultorios}
        turnoExistente={null}
      />
    </div>
  );
}

function TarjetaStat({
  label,
  valor,
  sub,
  color,
}: {
  label: string;
  valor: number | string;
  sub?: string;
  color: "coral" | "lavanda" | "naranja" | "verde";
}) {
  const bg = {
    coral: "bg-coral-soft text-coral-dark",
    lavanda: "bg-lavanda-soft text-lavanda-dark",
    naranja: "bg-naranja-soft text-naranja",
    verde: "bg-verde-soft text-verde-dark",
  }[color];
  return (
    <div className="ec-glass rounded-xl2 shadow-glass p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
        <span className="w-2 h-2 rounded-full bg-current" />
      </div>
      <p className="font-display font-extrabold text-xl text-tinta leading-none mb-1">{valor}</p>
      <p className="text-[11px] text-tinta-faint font-medium">{label}</p>
      {sub && <p className="text-[10px] text-tinta-faint/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function TarjetaMini({
  label,
  valor,
  color,
  serie,
}: {
  label: string;
  valor: number | string;
  color: string;
  serie: number[];
}) {
  return (
    <div className="ec-glass rounded-xl2 shadow-glass p-3.5">
      <p className="text-[11px] text-tinta-faint font-medium mb-0.5">{label}</p>
      <p className="font-display font-extrabold text-lg text-tinta leading-none">{valor}</p>
      <Sparkline valores={serie.length ? serie : [0, 0]} color={color} />
    </div>
  );
}
