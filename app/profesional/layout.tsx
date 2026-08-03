import { leerSesion } from "@/lib/auth";
import Logo from "@/components/Logo";
import AsistenteClave from "@/components/AsistenteClave";
import LogoutButton from "./LogoutButton";

export default function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const sesion = leerSesion();
  return (
    <div className="ec-fondo-organico min-h-screen bg-crema">
      <header className="ec-glass mx-4 mt-4 rounded-xl3 shadow-glass flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="w-px h-8 bg-tinta-faint/20" />
          <h1 className="font-display font-bold text-lg text-tinta leading-tight">Hola, {sesion?.nombre}</h1>
        </div>
        <LogoutButton />
      </header>
      <main className="p-6 max-w-3xl mx-auto">{children}</main>
      <AsistenteClave />
    </div>
  );
}
