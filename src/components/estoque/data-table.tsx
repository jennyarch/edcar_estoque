"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  MinusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ItemFormDialog } from "@/components/estoque/item-form-dialog";
import { StockOutDialog } from "@/components/estoque/stock-out-dialog";
import { ConfirmDeleteDialog } from "@/components/estoque/confirm-delete-dialog";
import { ESTOQUE_BAIXO } from "@/lib/constants";
import { formatBRL, formatDateTime, formatQuantidade } from "@/lib/format";
import type { Categoria, Item } from "@/types/item";

type Acao = {
  tipo: "editar" | "baixa" | "excluir";
  item: Item;
};

interface DataTableProps {
  categoria: Categoria;
  items: Item[];
}

function EstoqueBadge({ quantidade }: { quantidade: number }) {
  if (quantidade === 0) {
    return <Badge variant="destructive">Esgotado</Badge>;
  }
  if (quantidade <= ESTOQUE_BAIXO) {
    return (
      <Badge variant="outline" className="text-amber-700 dark:text-amber-400">
        {formatQuantidade(quantidade)} · baixo
      </Badge>
    );
  }
  return <Badge variant="secondary">{formatQuantidade(quantidade)}</Badge>;
}

export function DataTable({ categoria, items }: DataTableProps) {
  const [acao, setAcao] = useState<Acao | null>(null);
  const mostrarValor = categoria === "pecas";

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl ring-1 ring-foreground/10 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden lg:table-cell">Modelo</TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                Medidas
              </TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                {mostrarValor ? "Valor" : "Atualizado"}
              </TableHead>
              <TableHead className="w-14 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">
                  {item.codigo}
                </TableCell>
                <TableCell className="font-medium">
                  <span className="block max-w-56 truncate">{item.nome}</span>
                  {item.descricao ? (
                    <span className="block max-w-56 truncate text-xs font-normal text-muted-foreground">
                      {item.descricao}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {item.modelo}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right tabular-nums">
                  {formatQuantidade(item.medidas)} mm
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex justify-end">
                    <EstoqueBadge quantidade={item.qtd_estoque} />
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right tabular-nums">
                  {mostrarValor ? (
                    formatBRL(item.valor)
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(item.updated_at)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <LinhaAcoes item={item} setAcao={setAcao} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold">{item.nome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.codigo} · {item.modelo}
                </p>
              </div>
              <EstoqueBadge quantidade={item.qtd_estoque} />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                {mostrarValor ? (
                  <span className="font-medium text-foreground">
                    {formatBRL(item.valor)}
                  </span>
                ) : (
                  <span>
                    {formatQuantidade(item.medidas)} mm ·{" "}
                    {formatDateTime(item.updated_at)}
                  </span>
                )}
              </p>
              <LinhaAcoes item={item} setAcao={setAcao} />
            </div>
          </li>
        ))}
      </ul>

      {acao?.tipo === "editar" ? (
        <ItemFormDialog
          categoria={categoria}
          item={acao.item}
          open
          onOpenChange={(open) => {
            if (!open) setAcao(null);
          }}
        />
      ) : null}

      {acao?.tipo === "baixa" ? (
        <StockOutDialog
          item={acao.item}
          open
          onOpenChange={(open) => {
            if (!open) setAcao(null);
          }}
        />
      ) : null}

      {acao?.tipo === "excluir" ? (
        <ConfirmDeleteDialog
          item={acao.item}
          open
          onOpenChange={(open) => {
            if (!open) setAcao(null);
          }}
        />
      ) : null}
    </>
  );
}

function LinhaAcoes({
  item,
  setAcao,
}: {
  item: Item;
  setAcao: (acao: Acao) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Ações de ${item.nome}`}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setAcao({ tipo: "editar", item })}>
          <Pencil aria-hidden="true" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={item.qtd_estoque === 0}
          onSelect={() => setAcao({ tipo: "baixa", item })}
        >
          <MinusCircle aria-hidden="true" />
          Dar baixa
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => setAcao({ tipo: "excluir", item })}
        >
          <Trash2 aria-hidden="true" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
