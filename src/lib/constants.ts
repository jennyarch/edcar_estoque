import type { Categoria, SearchField } from "@/types/item";

export const PAGE_SIZES = [20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 20;

export const SEARCH_FIELDS: { value: SearchField; label: string }[] = [
  { value: "nome", label: "Nome" },
  { value: "codigo", label: "Código" },
  { value: "modelo", label: "Modelo" },
];

export const ESTOQUE_BAIXO = 2;

/** Tamanho máximo (em caracteres) do avatar em base64 enviado no cadastro. */
export const AVATAR_MAX_CHARS = 8000;

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  diafragma: "Diafragma",
  pecas: "Peças de Reposição e Reparo",
};

export const CATEGORIA_DESCRICAO: Record<Categoria, string> = {
  diafragma:
    "Diafragmas hidrovácuo — controle de código, medidas e saldo em estoque.",
  pecas:
    "Peças de reposição e reparo do hidrovácuo — cadastro, precificação e baixa.",
};

export const NAV_ITEMS: {
  href: string;
  label: string;
  categoria?: Categoria;
}[] = [
  { href: "/", label: "Início" },
  { href: "/estoque/diafragma", label: "Diafragma", categoria: "diafragma" },
  { href: "/estoque/pecas", label: "Peças", categoria: "pecas" },
];
