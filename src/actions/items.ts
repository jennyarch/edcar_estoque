"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  firstIssue,
  isCategoria,
  itemFormSchema,
  type ItemFormValues,
} from "@/lib/validators";
import { parseBRLToNumber } from "@/lib/format";
import type { ActionResult } from "@/types/actions";
import type { Categoria, ItemPayload } from "@/types/item";

const SESSAO_EXPIRADA = "Sessão expirada. Entre novamente para continuar.";

type Session = Awaited<ReturnType<typeof requireAuth>>;

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return { supabase, user };
}

function revalidarEstoque(): void {
  revalidatePath("/", "layout");
}

function toPayload(
  categoria: Categoria,
  values: ItemFormValues,
): ItemPayload | null {
  const valorNumero =
    categoria === "pecas" ? parseBRLToNumber(values.valor) : null;

  if (categoria === "pecas" && (valorNumero === null || valorNumero <= 0)) {
    return null;
  }

  return {
    categoria,
    codigo: values.codigo,
    nome: values.nome,
    modelo: values.modelo,
    descricao: values.descricao.length > 0 ? values.descricao : null,
    medidas: Number(values.medidas),
    qtd_estoque: Number(values.qtd_estoque),
    valor: valorNumero,
  };
}

export async function createItem(
  categoria: Categoria,
  values: ItemFormValues,
): Promise<ActionResult<{ id: string }>> {
  if (!isCategoria(categoria)) {
    return { ok: false, error: "Categoria inválida." };
  }

  const parsed = itemFormSchema(categoria).safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }

  const payload = toPayload(categoria, parsed.data);
  if (!payload) {
    return { ok: false, error: "Informe um valor unitário válido." };
  }

  const session: Session = await requireAuth();
  if (!session) return { ok: false, error: SESSAO_EXPIRADA };

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("items")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Não foi possível criar o item.",
    };
  }

  if (payload.qtd_estoque > 0) {
    await supabase.from("stock_movements").insert({
      item_id: data.id,
      tipo: "entrada",
      quantidade: payload.qtd_estoque,
      saldo_anterior: 0,
      saldo_posterior: payload.qtd_estoque,
      user_id: user.id,
    });
  }

  revalidarEstoque();
  return { ok: true, data: { id: data.id } };
}

export async function updateItem(
  itemId: string,
  categoria: Categoria,
  values: ItemFormValues,
): Promise<ActionResult> {
  if (!isCategoria(categoria)) {
    return { ok: false, error: "Categoria inválida." };
  }

  const parsed = itemFormSchema(categoria).safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }

  const payload = toPayload(categoria, parsed.data);
  if (!payload) {
    return { ok: false, error: "Informe um valor unitário válido." };
  }

  const session: Session = await requireAuth();
  if (!session) return { ok: false, error: SESSAO_EXPIRADA };

  const { supabase, user } = session;

  const { data: atual, error: erroLeitura } = await supabase
    .from("items")
    .select("id, qtd_estoque")
    .eq("id", itemId)
    .maybeSingle();

  if (erroLeitura) {
    return { ok: false, error: erroLeitura.message };
  }
  if (!atual) {
    return { ok: false, error: "Item não encontrado." };
  }

  const { error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", itemId);

  if (error) {
    return { ok: false, error: error.message };
  }

  if (payload.qtd_estoque !== atual.qtd_estoque) {
    await supabase.from("stock_movements").insert({
      item_id: itemId,
      tipo: "ajuste",
      quantidade: Math.abs(payload.qtd_estoque - atual.qtd_estoque),
      saldo_anterior: atual.qtd_estoque,
      saldo_posterior: payload.qtd_estoque,
      user_id: user.id,
    });
  }

  revalidarEstoque();
  return { ok: true };
}

export async function deleteItem(itemId: string): Promise<ActionResult> {
  const session: Session = await requireAuth();
  if (!session) return { ok: false, error: SESSAO_EXPIRADA };

  const { supabase } = session;
  const { data: atual, error: erroLeitura } = await supabase
    .from("items")
    .select("id, nome")
    .eq("id", itemId)
    .maybeSingle();

  if (erroLeitura) return { ok: false, error: erroLeitura.message };
  if (!atual) return { ok: false, error: "Item não encontrado." };

  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) return { ok: false, error: error.message };

  revalidarEstoque();
  return { ok: true };
}

/**
 * Baixa atômica: delega para a função SQL `dar_baixa`, que trava a linha,
 * valida o saldo e grava o movimento em `stock_movements`.
 */
export async function baixaItem(
  itemId: string,
  quantidade: number,
): Promise<ActionResult<{ saldo: number }>> {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    return { ok: false, error: "Informe uma quantidade inteira maior que zero." };
  }
  if (quantidade > 999999) {
    return { ok: false, error: "Quantidade muito alta." };
  }

  const session: Session = await requireAuth();
  if (!session) return { ok: false, error: SESSAO_EXPIRADA };

  const { supabase } = session;
  const { data, error } = await supabase.rpc("dar_baixa", {
    item_id: itemId,
    quantidade,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const saldo = typeof data === "number" ? data : Number(data);
  if (!Number.isFinite(saldo)) {
    return { ok: false, error: "Não foi possível confirmar a baixa." };
  }

  revalidarEstoque();
  return { ok: true, data: { saldo } };
}
