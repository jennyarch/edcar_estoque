"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronUp,
  Disc3,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Wrench,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { NAV_ITEMS } from "@/lib/constants";
import type { PerfilUsuario } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const ICONES: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/estoque/diafragma": Disc3,
  "/estoque/pecas": Wrench,
};

function isAtivo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppSidebarProps {
  perfil: PerfilUsuario;
}

export function AppSidebar({ perfil }: AppSidebarProps) {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Início">
              <Link href="/">
                <Logo
                  variant="sidebar"
                  className="[&>span:last-child]:group-data-[collapsible=icon]:hidden"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Estoque</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map(({ href, label }) => {
              const Icon = ICONES[href] ?? LayoutDashboard;
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isAtivo(pathname, href)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring"
            >
              <UserAvatar nome={perfil.nome} url={perfil.avatarUrl} />
              <span className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                  {perfil.nome}
                </span>
                <span className="truncate text-xs text-white/50">
                  {perfil.email}
                </span>
              </span>
              <ChevronUp
                className="size-4 text-white/50 group-data-[collapsible=icon]:hidden"
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
          >
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {perfil.email || "Usuário EdCar"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                window.setTimeout(() => formRef.current?.submit(), 0);
              }}
            >
              <LogOut aria-hidden="true" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <form ref={formRef} action={logoutAction} className="hidden" />
      </SidebarFooter>
    </Sidebar>
  );
}
