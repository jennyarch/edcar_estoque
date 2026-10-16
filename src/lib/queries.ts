import { apiGet } from "@/lib/api/client";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type {
  Categoria,
  Item,
  ListagemResult,
  MovimentoComItem,
  SearchField,
} from "@/types/item";
import type { ListagemSearchParams } from "@/lib/validators";

interface ListagemResponse {
  items: Item[];
  total: number;
}

/**
 * Listagem paginada de uma categoria via `/api/items`.
 * A paginação é feita no servidor (skip/take do Prisma).
 */
export async function buscarListagem(
  categoria: Categoria,
  params: ListagemSearchParams,
  token?: string | null,
): Promise<ListagemResult> {
  const pagina = params.pagina ?? 1;
  const tamanho = params.tamanho ?? DEFAULT_PAGE_SIZE;
  const campo = (params.campo ?? "nome") as SearchField;
  const busca = params.q?.trim();

  const query = new URLSearchParams({
    categoria,
    pagina: String(pagina),
    tamanho: String(tamanho),
  });

  if (busca) {
    query.set("q", busca);
    query.set("campo", campo);
  }

  try {
    const data = await apiGet<ListagemResponse>(
      `/api/items?${query.toString()}`,
      token ?? undefined,
    );
    return { items: data.items, total: data.total, error: null };
  } catch (error) {
    return {
      items: [],
      total: 0,
      error: error instanceof Error ? error.message : "Erro ao carregar.",
    };
  }
}

export interface ResumoDashboard {
  totalItens: number;
  totalUnidades: number;
  itensBaixo: number;
  valorEstoque: number;
  baixos: Item[];
  movimentacoes: MovimentoComItem[];
}

export async function buscarResumoDashboard(
  token?: string | null,
): Promise<ResumoDashboard> {
  return apiGet<ResumoDashboard>("/api/dashboard", token ?? undefined);
}
