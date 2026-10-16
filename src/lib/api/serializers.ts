import type {
  Item as PrismaItem,
  StockMovement as PrismaStockMovement,
} from "@prisma/client";
import type { Item, ItemResumo, MovimentoComItem } from "@/types/item";

export function toItemDTO(item: PrismaItem): Item {
  return {
    id: item.id,
    categoria: item.categoria,
    codigo: item.codigo,
    nome: item.nome,
    modelo: item.modelo,
    descricao: item.descricao,
    medidas: item.medidas,
    qtd_estoque: item.qtdEstoque,
    valor: item.valor === null ? null : Number(item.valor),
    created_at: item.createdAt.toISOString(),
    updated_at: item.updatedAt.toISOString(),
  };
}

export function toMovimentoDTO(
  movimento: PrismaStockMovement,
  item: ItemResumo | null,
): MovimentoComItem {
  return {
    id: movimento.id,
    item_id: movimento.itemId,
    tipo: movimento.tipo,
    quantidade: movimento.quantidade,
    saldo_anterior: movimento.saldoAnterior,
    saldo_posterior: movimento.saldoPosterior,
    user_id: movimento.userId,
    created_at: movimento.createdAt.toISOString(),
    item,
  };
}
