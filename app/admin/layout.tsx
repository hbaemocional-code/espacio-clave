import AdminShell from "@/components/AdminShell";
import TopBar from "@/components/TopBar";
import AsistenteClave from "@/components/AsistenteClave";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <TopBar />
      {children}
      <AsistenteClave />
    </AdminShell>
  );
}
