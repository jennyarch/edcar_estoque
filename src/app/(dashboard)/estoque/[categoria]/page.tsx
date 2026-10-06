import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eraser, PackageSearch, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buscarListagem } from "@/lib/queries";
import { isCategoria, listagemSearchParamsSchema } from "@/lib/validators";
import {
  CATEGORIA_DESCRICAO,
  CATEGORIA_LABEL,
  DEFAULT_PAGE_SIZE,
} from "@/lib/constants";
import { formatQuantidade } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemsToolbar } from "@/components/estoque/items-toolbar";
import { DataTable } from "@/components/estoque/data-table";
import { Pagination } from "@/components/estoque/pagination";

type RawSearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  if (!isCategoria(categoria)) return { title: "Estoque" };
  return { title: CATEGORIA_LABEL[categoria] };
}

function somenteString(valor: string | string[] | undefined): string | undefined {
  return typeof valor === "string" ? valor : undefined;
}

export default async function EstoquePage({ params, searchParams }: PageProps) {
  const { categoria: slug } = await params;
  if (!isCategoria(slug)) notFound();

  const raw = await searchParams;
  const parse = listagemSearchParamsSchema.safeParse({
    q: somenteString(raw.q),
    campo: somenteString(raw.campo),
    pagina: somenteString(raw.pagina),
    tamanho: somenteString(raw.tamanho),
  });
  const filtros = parse.success
    ? parse.data
    : listagemSearchParamsSchema.parse({});

  const q = filtros.q ?? "";
  const campo = filtros.campo ?? "nome";
  const tamanho = filtros.tamanho ?? DEFAULT_PAGE_SIZE;
  let pagina = filtros.pagina ?? 1;

  const supabase = await createClient();
  let resultado = await buscarListagem(supabase, slug, {
    q,
    campo,
    pagina,
    tamanho,
  });

  const totalPaginas = Math.max(1, Math.ceil(resultado.total / tamanho));
  if (pagina > totalPaginas && resultado.total > 0) {
    pagina = totalPaginas;
    resultado = await buscarListagem(supabase, slug, {
      q,
      campo,
      pagina,
      tamanho,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5">
      <header className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {CATEGORIA_LABEL[slug]}
          </h2>
          <Badge variant="secondary">
            {formatQuantidade(resultado.total)} item(ns)
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {CATEGORIA_DESCRICAO[slug]}
        </p>
      </header>

      <ItemsToolbar categoria={slug} q={q} campo={campo} tamanho={tamanho} />

      {resultado.error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm font-medium text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Não foi possível carregar o estoque. Tente novamente.{" "}
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
              <Link href={`/estoque/${slug}`}>
                <Eraser aria-hidden="true" />
                Limpar busca
              </Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <DataTable categoria={slug} items={resultado.items} />
      )}

      <Pagination
        categoria={slug}
        pagina={pagina}
        totalPaginas={totalPaginas}
        total={resultado.total}
        q={q}
        campo={campo}
        tamanho={tamanho}
      />
    </div>
  );
}
