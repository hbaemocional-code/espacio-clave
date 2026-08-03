"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión");
        return;
      }
      router.push(data.tipo === "admin" ? "/admin" : "/profesional");
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="ec-glass rounded-xl3 p-7 shadow-glass-lg space-y-4"
    >
      <div>
        <label className="block text-xs font-medium text-tinta-soft mb-1.5 ml-1">Usuario</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tinta-faint" strokeWidth={2} />
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full rounded-xl2 border border-white/60 bg-white/70 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 focus:border-lavanda/50 transition"
            autoFocus
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-tinta-soft mb-1.5 ml-1">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tinta-faint" strokeWidth={2} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl2 border border-white/60 bg-white/70 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-lavanda/40 focus:border-lavanda/50 transition"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-coral-dark bg-coral-soft rounded-xl2 px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-xl2 bg-gradiente-marca text-white py-2.5 font-semibold text-sm shadow-glow-coral hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
      >
        {cargando ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="text-xs text-center text-tinta-faint pt-1">
        Profesionales: usen el usuario y contraseña que les asignó administración.
      </p>
    </form>
  );
}
