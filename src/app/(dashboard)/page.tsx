import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  Layers,
  Package,
  TriangleAlert,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buscarResumoDashboard } from "@/lib/queries";
import { formatBRL, formatQuantidade } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import { EstoqueBaixoCard } from "@/components/dashboard/estoque-baixo-card";
import { MovimentacoesCard } from "@/components/dashboard/movimentacoes-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Visão geral",
};

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const perfil = await requireUser();
  const supabase = await createClient();
  const resumo = await buscarResumoDashboard(supabase);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-primary">
            {saudacao()}, {perfil.nome.split(" ")[0]}
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
