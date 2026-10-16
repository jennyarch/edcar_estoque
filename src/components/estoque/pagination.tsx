import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatQuantidade } from "@/lib/format";
import type { SearchField } from "@/types/item";

interface PaginationProps {
  categoria: string;
  pagina: number;
  totalPaginas: number;
  total: number;
  q: string;
  campo: SearchField;
  tamanho: number;
}

export function Pagination({
  categoria,
  pagina,
  totalPaginas,
  total,
  q,
  campo,
  tamanho,
}: PaginationProps) {
  if (totalPaginas <= 1) {
    return (
      <p className="text-center text-xs text-muted-foreground sm:text-right">
        {formatQuantidade(total)} item(ns) no total.
      </p>
    );
  }

  const base = `/estoque/${categoria}`;
  const comuns: Record<string, string> = {
    campo,
    tamanho: String(tamanho),
    ...(q ? { q } : {}),
  };

  const anterior = Math.max(1, pagina - 1);
  const proxima = Math.min(totalPaginas, pagina + 1);
  const podeAnterior = pagina > 1;
  const podeProxima = pagina < totalPaginas;

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-xs text-muted-foreground">
        {formatQuantidade(total)} item(ns) · página{" "}
        {formatQuantidade(pagina)} de {formatQuantidade(totalPaginas)}
      </p>

      <div className="flex items-center gap-2">
        {podeAnterior ? (
          <Button asChild variant="outline" size="sm">
            <Link
              href={`${base}?${new URLSearchParams({
                ...comuns,
                pagina: String(anterior),
              })}`}
            >
              <ChevronLeft aria-hidden="true" />
              Anterior
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft aria-hidden="true" />
            Anterior
          </Button>
        )}

        {podeProxima ? (
          <Button asChild variant="outline" size="sm">
            <Link
              href={`${base}?${new URLSearchParams({
                ...comuns,
                pagina: String(proxima),
              })}`}
            >
              Próxima
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Próxima
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </nav>
  );
}
