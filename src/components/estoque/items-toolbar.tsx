"use client";

import Link from "next/link";
import { Eraser, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NovoItemButton } from "@/components/estoque/novo-item-button";
import { PAGE_SIZES, SEARCH_FIELDS } from "@/lib/constants";
import type { Categoria, SearchField } from "@/types/item";

interface ItemsToolbarProps {
  categoria: Categoria;
  q: string;
  campo: SearchField;
  tamanho: number;
}

export function ItemsToolbar({
  categoria,
  q,
  campo,
  tamanho,
}: ItemsToolbarProps) {
  const action = `/estoque/${categoria}`;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form
        action={action}
        method="get"
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar nome, código ou modelo"
            className="pl-9"
            aria-label="Buscar itens"
          />
        </div>

        <div className="flex gap-2">
          <Select name="campo" defaultValue={campo}>
            <SelectTrigger className="w-full sm:w-36" aria-label="Campo de busca">
              <SlidersHorizontal aria-hidden="true" />
              <SelectValue placeholder="Campo" />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_FIELDS.map((campoOpcao) => (
                <SelectItem key={campoOpcao.value} value={campoOpcao.value}>
                  {campoOpcao.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="tamanho" defaultValue={String(tamanho)}>
            <SelectTrigger className="w-full sm:w-24" aria-label="Itens por página">
              <SelectValue placeholder="20" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((tamanhoOpcao) => (
                <SelectItem
                  key={tamanhoOpcao}
                  value={String(tamanhoOpcao)}
                >
                  {tamanhoOpcao} / pg
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="secondary" className="shrink-0">
            <Search aria-hidden="true" />
            Buscar
          </Button>

          {q ? (
            <Button asChild variant="ghost" className="shrink-0">
              <Link href={action}>
                <Eraser aria-hidden="true" />
                Limpar
              </Link>
            </Button>
          ) : null}
        </div>
      </form>

      <NovoItemButton categoria={categoria} />
    </div>
  );
}
