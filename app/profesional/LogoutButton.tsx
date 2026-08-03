"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  async function salir() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={salir}
      className="flex items-center gap-1.5 text-sm font-medium text-tinta-faint hover:text-tinta transition-colors"
    >
      <LogOut className="w-4 h-4" strokeWidth={2} />
      Cerrar sesión
    </button>
  );
}
