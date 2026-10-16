"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TITULOS: Record<string, string> = {
  "/": "Visão geral",
  "/estoque/diafragma": "Diafragmas",
  "/estoque/pecas": "Peças de reposição e reparo",
};

export function Header() {
  const pathname = usePathname();
  const titulo =
    TITULOS[pathname] ??
    (pathname.startsWith("/estoque/") ? "Estoque" : "EdCar Estoque");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <span className="h-5 w-px bg-border" aria-hidden="true" />
      <h1 className="min-w-0 truncate text-sm font-semibold tracking-tight sm:text-base">
        {titulo}
      </h1>
    </header>
  );
}
