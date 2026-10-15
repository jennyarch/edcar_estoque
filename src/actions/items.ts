"use server";

import { criarClienteAutenticado } from "@/lib/supabase/server";
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

/**
 * A sessão vive no localStorage do navegador; o access token é enviado
 * junto à chamada e usado como header `Authorization` (RLS no servidor).
 */
function cliente(accessToken: string) {
  return criarClienteAutenticado(accessToken);
}

function mensagemDe(erro: { status?: number; message?: string } | null): string {
  if (!erro) return "Não foi possível concluir a operação.";
  if (erro.status === 401) return SESSAO_EXPIRADA;
  return erro.message || "Não foi possível concluir a operação.";
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
  accessToken: string,
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

  const supabase = cliente(accessToken);
  const { data, error } = await supabase
    .from("items")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: mensagemDe(error) };
  }

  if (payload.qtd_estoque > 0) {
    await supabase.from("stock_movements").insert({
      item_id: data.id,
      tipo: "entrada",
      quantidade: payload.qtd_estoque,
      saldo_anterior: 0,
      saldo_posterior: payload.qtd_estoque,
      user_id: null,
    });
  }

  return { ok: true, data: { id: data.id } };
}

export async function updateItem(
  accessToken: string,
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

  const supabase = cliente(accessToken);

  const { data: atual, error: erroLeitura } = await supabase
    .from("items")
    .select("id, qtd_estoque")
    .eq("id", itemId)
    .maybeSingle();

  if (erroLeitura) return { ok: false, error: mensagemDe(erroLeitura) };
  if (!atual) return { ok: false, error: "Item não encontrado." };

  const { error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", itemId);

  if (error) return { ok: false, error: mensagemDe(error) };

  if (payload.qtd_estoque !== atual.qtd_estoque) {
    await supabase.from("stock_movements").insert({
      item_id: itemId,
      tipo: "ajuste",
      quantidade: Math.abs(payload.qtd_estoque - atual.qtd_estoque),
      saldo_anterior: atual.qtd_estoque,
      saldo_posterior: payload.qtd_estoque,
      user_id: null,
    });
  }

  return { ok: true };
}

export async function deleteItem(
  accessToken: string,
  itemId: string,
): Promise<ActionResult> {
  const supabase = cliente(accessToken);

  const { data: atual, error: erroLeitura } = await supabase
    .from("items")
    .select("id, nome")
    .eq("id", itemId)
    .maybeSingle();

  if (erroLeitura) return { ok: false, error: mensagemDe(erroLeitura) };
  if (!atual) return { ok: false, error: "Item não encontrado." };

  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) return { ok: false, error: mensagemDe(error) };

  return { ok: true };
}

/**
 * Baixa atômica: delega para a função SQL `dar_baixa`, que trava a linha,
 * valida o saldo e grava o movimento em `stock_movements`.
 */
export async function baixaItem(
  accessToken: string,
  itemId: string,
  quantidade: number,
): Promise<ActionResult<{ saldo: number }>> {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    return {
      ok: false,
      error: "Informe uma quantidade inteira maior que zero.",
    };
  }
  if (quantidade > 999999) {
    return { ok: false, error: "Quantidade muito alta." };
  }

  const supabase = cliente(accessToken);
  const { data, error } = await supabase.rpc("dar_baixa", {
    item_id: itemId,
    quantidade,
  });

  if (error) return { ok: false, error: mensagemDe(error) };

  const saldo = typeof data === "number" ? data : Number(data);
  if (!Number.isFinite(saldo)) {
    return { ok: false, error: "Não foi possível confirmar a baixa." };
  }

  return { ok: true, data: { saldo } };
}