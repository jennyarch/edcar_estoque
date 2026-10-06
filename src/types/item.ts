export const CATEGORIAS = ["diafragma", "pecas"] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export type Item = {
  id: string;
  categoria: Categoria;
  codigo: string;
  nome: string;
  modelo: string;
  descricao: string | null;
  medidas: number;
  qtd_estoque: number;
  valor: number | null;
  created_at: string;
  updated_at: string;
};

export type ItemPayload = Pick<
  Item,
  | "categoria"
  | "codigo"
  | "nome"
  | "modelo"
  | "descricao"
  | "medidas"
  | "qtd_estoque"
  | "valor"
>;

export type ItemInsert = ItemPayload &
  Partial<Pick<Item, "id" | "created_at" | "updated_at">>;

export type ItemUpdate = Partial<Omit<Item, "id" | "created_at" | "updated_at">>;

export const TIPOS_MOVIMENTO = ["entrada", "baixa", "ajuste"] as const;

export type TipoMovimento = (typeof TIPOS_MOVIMENTO)[number];

export type StockMovement = {
  id: string;
  item_id: string;
  tipo: TipoMovimento;
  quantidade: number;
  saldo_anterior: number | null;
  saldo_posterior: number | null;
  user_id: string | null;
  created_at: string;
};

export type StockMovementInsert = Omit<StockMovement, "id" | "created_at"> &
  Partial<Pick<StockMovement, "id" | "created_at">>;

export type ItemResumo = Pick<Item, "nome" | "codigo" | "categoria">;

export type MovimentoComItem = StockMovement & { item: ItemResumo | null };

export type EstoqueCategoria = Categoria;

/** Colunas pesquisáveis na listagem. */
export const SEARCHABLE_COLUMNS = ["nome", "codigo", "modelo"] as const;

export type SearchField = (typeof SEARCHABLE_COLUMNS)[number];

export type ListagemResult = {
  items: Item[];
  total: number;
  error: string | null;
};
