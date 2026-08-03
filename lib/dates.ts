import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export function lunesDeSemana(fecha: Date) {
  return startOfWeek(fecha, { weekStartsOn: 1 });
}

export function diasDeSemana(fecha: Date, cantidad = 6) {
  const lunes = lunesDeSemana(fecha);
  return Array.from({ length: cantidad }, (_, i) => addDays(lunes, i));
}

export function aISO(fecha: Date) {
  return format(fecha, "yyyy-MM-dd");
}

export function etiquetaDia(fecha: Date) {
  return format(fecha, "EEEE d", { locale: es });
}

export function etiquetaMes(fecha: Date) {
  const s = format(fecha, "LLLL yyyy", { locale: es });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Franjas horarias de atención: 08:00 a 21:00 cada 30'
export function franjasHorarias(inicio = 8, fin = 21, pasoMin = 30) {
  const franjas: string[] = [];
  for (let m = inicio * 60; m < fin * 60; m += pasoMin) {
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const min = String(m % 60).padStart(2, "0");
    franjas.push(`${h}:${min}`);
  }
  return franjas;
}

export function sumarMinutos(hora: string, minutos: number) {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
