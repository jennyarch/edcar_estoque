"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CircleDollarSign,
  Layers,
  Package,
  TriangleAlert,
} from "lucide-react";
import { EstoqueBaixoCard } from "@/components/dashboard/estoque-baixo-card";
import { MovimentacoesCard } from "@/components/dashboard/movimentacoes-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { useSessao } from "@/components/session/session-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { aoAtualizarEstoque } from "@/lib/estoque-events";
import { formatBRL, formatQuantidade } from "@/lib/format";
import { buscarResumoDashboard, type ResumoDashboard } from "@/lib/queries";

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardCliente() {
  const { perfil, token } = useSessao();
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async (): Promise<ResumoDashboard> => {
    if (!token) throw new Error("Sessão expirada. Entre novamente.");
    return buscarResumoDashboard(token);
  }, [token]);

  const recarregar = useCallback(() => {
    void carregar().then(
      (dados) => {
        setErro(null);
        setResumo(dados);
      },
      (causa: unknown) => {
        setErro(
          causa instanceof Error
            ? causa.message
            : "Não foi possível carregar o resumo.",
        );
      },
    );
  }, [carregar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  useEffect(() => aoAtualizarEstoque(recarregar), [recarregar]);

  if (erro) {
    return (
      <div
        role="alert"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start gap-3 self-start rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm font-medium text-destructive"
      >
        <p>Não foi possível carregar o resumo. Tente novamente.</p>
        <p className="font-normal">{erro}</p>
        <Button variant="outline" size="sm" onClick={recarregar}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!resumo) {
    return (
      <div
        aria-hidden="true"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6"
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-primary">
            {saudacao()}, {perfil?.nome.split(" ")[0]}
          </p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Visão geral do estoque
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe saldos, reposições e movimentações da loja em um só lugar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/estoque/diafragma">
              Diafragmas
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/estoque/pecas">
              Peças
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Itens cadastrados"
          valor={formatQuantidade(resumo.totalItens)}
          icone={Package}
          detalhe="Diafragmas e peças"
        />
        <StatCard
          titulo="Unidades em estoque"
          valor={formatQuantidade(resumo.totalUnidades)}
          icone={Layers}
          detalhe="Somando todas as categorias"
        />
        <StatCard
          titulo="Estoque baixo"
          valor={formatQuantidade(resumo.itensBaixo)}
          icone={TriangleAlert}
          detalhe="Itens com até 2 unidades"
          tone={resumo.itensBaixo > 0 ? "alerta" : "default"}
        />
        <StatCard
          titulo="Valor em peças"
          valor={formatBRL(resumo.valorEstoque)}
          icone={CircleDollarSign}
          detalhe="Preço de custo × saldo"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <EstoqueBaixoCard itens={resumo.baixos} />
        <MovimentacoesCard movimentacoes={resumo.movimentacoes} />
      </section>
    </div>
  );
}