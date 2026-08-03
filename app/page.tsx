import { redirect } from "next/navigation";
import { leerSesion } from "@/lib/auth";

export default function Home() {
  const sesion = leerSesion();
  if (sesion?.tipo === "admin") redirect("/admin");
  if (sesion?.tipo === "profesional") redirect("/profesional");
  redirect("/login");
}
