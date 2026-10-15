import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { DEFAULT_PAGE_SIZE, ESTOQUE_BAIXO } from "@/lib/constants";
import { escapeLike } from "@/lib/format";
import type {
  Categoria,
  Item,
  ListagemResult,
  MovimentoComItem,
} from "@/types/item";
import type { ListagemSearchParams } from "@/lib/validators";

type Cliente = SupabaseClient<Database>;

/**
 * Listagem paginada de um categoria, com busca em um único campo.
 * A paginação é feita com `range` (from/to) sobre um total via count.
 */
export async function buscarListagem(
  supabase: Cliente,
  categoria: Categoria,
  params: ListagemSearchParams,
): Promise<ListagemResult> {
  const pagina = params.pagina ?? 1;
  const tamanho = params.tamanho ?? DEFAULT_PAGE_SIZE;
  const campo = params.campo ?? "nome";
  const busca = params.q?.trim();

  const from = (pagina - 1) * tamanho;
  const to = from + tamanho - 1;

  let query = supabase
    .from("items")
    .select("*", { count: "exact" })
    .eq("categoria", categoria)
    .order("nome", { ascending: true })
    .range(from, to);

  if (busca) {
    query = query.ilike(campo, `%${escapeLike(busca)}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return { items: [], total: 0, error: error.message };
  }

  return {
    items: (data ?? []) as Item[],
    total: count ?? 0,
    error: null,
  };
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
  supabase: Cliente,
): Promise<ResumoDashboard> {
  const { data: itens, error } = await supabase
    .from("items")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const lista = (itens ?? []) as Item[];
  const baixos = lista
    .filter((item) => item.qtd_estoque <= ESTOQUE_BAIXO)
    .sort((a, b) => a.qtd_estoque - b.qtd_estoque || a.nome.localeCompare(b.nome))
    .slice(0, 6);

  const { data: movs } = await supabase
    .from("stock_movements")
    .select("*, item:items(nome, codigo, categoria)")
    .order("created_at", { ascending: false })
    .limit(8);

  return {
    totalItens: lista.length,
    totalUnidades: lista.reduce((acc, item) => acc + item.qtd_estoque, 0),
    itensBaixo: baixos.length,
    valorEstoque: lista.reduce((acc, item) => {
      if (item.categoria !== "pecas" || !item.valor) return acc;
      return acc + item.valor * item.qtd_estoque;
    }, 0),
    baixos,
    movimentacoes: (movs ?? []) as MovimentoComItem[],
  };
}
