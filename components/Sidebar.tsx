"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, HelpCircle, LayoutGrid, LogOut, Users, Wallet2, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/admin/profesionales", label: "Profesionales", icon: Users },
  { href: "/admin/cierre", label: "Cierre mensual", icon: Wallet2 },
];

type SidebarProps = {
  abierto: boolean;
  onCerrar: () => void;
};

export default function Sidebar({ abierto, onCerrar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function salir() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 p-4 transform transition-transform duration-300 ease-in-out ${
        abierto ? "translate-x-0" : "-translate-x-full"
      } md:relative md:z-auto md:translate-x-0 md:shrink-0`}
    >
      <div className="bg-gradiente-panel rounded-xl3 shadow-glass-lg h-[calc(100vh-2rem)] flex flex-col sticky top-4 overflow-hidden">
        <div className="px-5 pt-6 pb-6 flex items-center justify-between">
          <Logo variant="oscuro" size="sm" />
          <button
            onClick={onCerrar}
            className="md:hidden text-white/60 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map((l) => {
            const activo = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onCerrar}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl2 text-sm font-medium transition-all ${
                  activo
                    ? "bg-gradiente-marca text-white shadow-glow-coral"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3">
          <div className="ec-glass-dark rounded-xl2 px-3.5 py-3 flex items-center gap-2 text-xs text-white/50 mb-1">
            <HelpCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
            ¿Necesitás ayuda? Centro de ayuda
          </div>
          <button
            onClick={salir}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-left rounded-xl2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
