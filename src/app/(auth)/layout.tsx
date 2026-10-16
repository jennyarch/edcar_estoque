"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthAside } from "@/components/auth/auth-aside";
import { CarregandoTela } from "@/components/loading-screen";
import { useSessao } from "@/components/session/session-provider";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { carregando, perfil } = useSessao();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && perfil) {
      router.replace("/");
    }
  }, [carregando, perfil, router]);

  if (carregando) {
    return <CarregandoTela />;
  }

  return (
    <main className="min-h-dvh w-full lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="w-full max-w-md">{children}</div>
      </section>
      <AuthAside />
    </main>
  );
}