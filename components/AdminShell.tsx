"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="ec-fondo-organico min-h-screen flex bg-crema">
      <Sidebar abierto={abierto} onCerrar={() => setAbierto(false)} />

      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setAbierto(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex-1 p-6 pl-2 min-w-0">
        <button
          onClick={() => setAbierto(true)}
          className="ec-glass mb-4 w-10 h-10 rounded-xl2 flex items-center justify-center text-tinta-soft hover:text-tinta transition md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        {children}
      </main>
    </div>
  );
}
