"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { CarregandoTela } from "@/components/loading-screen";
import { useSessao } from "@/components/session/session-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { carregando, perfil } = useSessao();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !perfil) {
      router.replace("/login");
    }
  }, [carregando, perfil, router]);

  if (carregando || !perfil) {
    return <CarregandoTela />;
  }

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