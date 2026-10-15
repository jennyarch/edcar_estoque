"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Eraser, PackageSearch, TriangleAlert } from "lucide-react";
import { DataTable } from "@/components/estoque/data-table";
import { EstoqueSkeleton } from "@/components/estoque/estoque-skeleton";
import { ItemsToolbar } from "@/components/estoque/items-toolbar";
import { Pagination } from "@/components/estoque/pagination";
import { useSessao } from "@/components/session/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aoAtualizarEstoque } from "@/lib/estoque-events";
import {
  CATEGORIA_DESCRICAO,
  CATEGORIA_LABEL,
  DEFAULT_PAGE_SIZE,
} from "@/lib/constants";
import { formatQuantidade } from "@/lib/format";
import { buscarListagem } from "@/lib/queries";
import {
  listagemSearchParamsSchema,
  type ListagemSearchParams,
} from "@/lib/validators";
import type { Categoria, ListagemResult } from "@/types/item";

function lerFiltros(searchParams: URLSearchParams): ListagemSearchParams {
  const parse = listagemSearchParamsSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    campo: searchParams.get("campo") ?? undefined,
    pagina: searchParams.get("pagina") ?? undefined,
    tamanho: searchParams.get("tamanho") ?? undefined,
  });
  return parse.success
    ? parse.data
    : { q: "", campo: "nome", pagina: 1, tamanho: DEFAULT_PAGE_SIZE };
}

interface Estado {
  resultado: ListagemResult;
  paginaExibida: number;
}

export function EstoqueCliente({ categoria }: { categoria: Categoria }) {
  const { supabase } = useSessao();
  const searchParams = useSearchParams();
  const filtros = useMemo(() => lerFiltros(searchParams), [searchParams]);

  const [estado, setEstado] = useState<Estado | null>(null);
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => aoAtualizarEstoque(() => setRecarregar((n) => n + 1)), []);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !ativo) return;

      const tamanho = filtros.tamanho ?? DEFAULT_PAGE_SIZE;
      const inicio = await buscarListagem(supabase, categoria, filtros);
      if (!ativo) return;

      const totalPaginas = Math.max(1, Math.ceil(inicio.total / tamanho));
      let resultado = inicio;
      let pagina = filtros.pagina ?? 1;

      if (pagina > totalPaginas && inicio.total > 0) {
        pagina = totalPaginas;
        resultado = await buscarListagem(supabase, categoria, {
          ...filtros,
          pagina,
        });
        if (!ativo) return;
      }

      setEstado({ resultado, paginaExibida: pagina });
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [supabase, categoria, filtros, recarregar]);

  if (!estado) {
    return <EstoqueSkeleton />;
  }

  const { resultado, paginaExibida } = estado;
  const q = filtros.q ?? "";
  const campo = filtros.campo ?? "nome";
  const tamanho = filtros.tamanho ?? DEFAULT_PAGE_SIZE;
  const totalPaginas = Math.max(1, Math.ceil(resultado.total / tamanho));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5">
      <header className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {CATEGORIA_LABEL[categoria]}
          </h2>
          <Badge variant="secondary">
            {formatQuantidade(resultado.total)} item(ns)
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {CATEGORIA_DESCRICAO[categoria]}
        </p>
      </header>

      <ItemsToolbar categoria={categoria} q={q} campo={campo} tamanho={tamanho} />

      {resultado.error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm font-medium text-destructive"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>
            Não foi possível carregar o estoque.{" "}
            <span className="font-normal">{resultado.error}</span>
          </span>
        </div>
      ) : resultado.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
          <PackageSearch
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold">
            {q ? "Nenhum resultado encontrado" : "Nenhum item cadastrado"}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {q ? (
              <>
                Nada encontrado para{" "}
                <span className="font-medium text-foreground">“{q}”</span> no
                campo {campo}. Verifique a grafia ou limpe a busca.
              </>
            ) : (
              "Cadastre o primeiro item desta categoria usando o botão “Novo item”."
            )}
          </p>
          {q ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/estoque/${categoria}`}>
                <Eraser aria-hidden="true" />
                Limpar busca
              </Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <DataTable categoria={categoria} items={resultado.items} />
      )}

      <Pagination
        categoria={categoria}
        pagina={paginaExibida}
        totalPaginas={totalPaginas}
        total={resultado.total}
        q={q}
        campo={campo}
        tamanho={tamanho}
      />
    </div>
  );
}