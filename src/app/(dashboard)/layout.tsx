import { requireUser } from "@/lib/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const perfil = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar perfil={perfil} />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          {children}
        </main>
        <footer className="border-t px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © EdCar Hidrovácuo · Sistema interno de estoque
        </footer>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
