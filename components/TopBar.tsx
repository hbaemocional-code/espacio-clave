import { Bell, Search } from "lucide-react";
import { leerSesion } from "@/lib/auth";

export default function TopBar() {
  const sesion = leerSesion();
  const inicial = (sesion?.nombre || "A").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tinta-faint" strokeWidth={2} />
        <input
          placeholder="Buscar pacientes, turnos, profesionales…"
          className="w-full ec-glass rounded-xl2 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-lavanda/30 placeholder:text-tinta-faint"
        />
      </div>
      <button className="ec-glass w-10 h-10 rounded-xl2 flex items-center justify-center text-tinta-soft hover:text-tinta transition relative shrink-0">
        <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-coral" />
      </button>
      <div className="ec-glass w-10 h-10 rounded-xl2 flex items-center justify-center font-display font-bold text-sm text-white bg-gradiente-marca shrink-0">
        {inicial}
      </div>
    </div>
  );
}
