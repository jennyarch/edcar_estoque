import type {
  Categoria,
  Item,
  ItemInsert,
  ItemUpdate,
  StockMovement,
  StockMovementInsert,
  TipoMovimento,
} from "@/types/item";
import type { Perfil, PerfilInsert, PerfilUpdate } from "@/types/auth";

/**
 * Tipos do schema Postgres (Supabase) — alinhados com
 * `supabase/migrations` e com `prisma/schema.prisma`.
 *
 * Mantidos manualmente para não depender da service_role key
 * (`supabase gen types typescript`) no ambiente de build.
 */
export interface Database {
  public: {
    Tables: {
      items: {
        Row: Item;
        Insert: ItemInsert;
        Update: ItemUpdate;
        Relationships: [];
      };
      profiles: {
        Row: Perfil;
        Insert: PerfilInsert;
        Update: PerfilUpdate;
        Relationships: [];
      };
      stock_movements: {
        Row: StockMovement;
        Insert: StockMovementInsert;
        Update: Partial<StockMovementInsert>;
        Relationships: [
          {
            foreignKeyName: "stock_movements_item_id_fkey";
            columns: ["item_id"];
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      dar_baixa: {
        Args: { item_id: string; quantidade: number };
        Returns: number;
      };
    };
    Enums: {
      categoria: Categoria;
      tipo_movimento: TipoMovimento;
    };
    CompositeTypes: Record<string, never>;
  };
}
