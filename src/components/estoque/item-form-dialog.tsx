"use client";

import { useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackagePlus, Save } from "lucide-react";
import { toast } from "sonner";
import { useSessao } from "@/components/session/session-provider";
import { createItemApi, updateItemApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notificarAtualizacaoEstoque } from "@/lib/estoque-events";
import { maskBRL, onlyDigits, parseBRLToNumber } from "@/lib/format";
import { itemFormSchema, type ItemFormValues } from "@/lib/validators";
import type { Categoria, Item, ItemPayload } from "@/types/item";

interface ItemFormDialogProps {
  categoria: Categoria;
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemFormDialog({
  categoria,
  item,
  open,
  onOpenChange,
}: ItemFormDialogProps) {
  const { token } = useSessao();
  const [pending, startTransition] = useTransition();
  const ehEdicao = item !== null;
  const mostrarValor = categoria === "pecas";

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema(categoria)),
    defaultValues: {
      codigo: item?.codigo ?? "",
      nome: item?.nome ?? "",
      modelo: item?.modelo ?? "",
      descricao: item?.descricao ?? "",
      medidas: item ? String(item.medidas) : "",
      qtd_estoque: item ? String(item.qtd_estoque) : "",
      valor: item?.valor != null ? maskBRL(String(Math.round(item.valor * 100))) : "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      codigo: item?.codigo ?? "",
      nome: item?.nome ?? "",
      modelo: item?.modelo ?? "",
      descricao: item?.descricao ?? "",
      medidas: item ? String(item.medidas) : "",
      qtd_estoque: item ? String(item.qtd_estoque) : "",
      valor:
        item?.valor != null ? maskBRL(String(Math.round(item.valor * 100))) : "",
    });
  }, [open, item, reset]);

  const valorAtual = useWatch({ control, name: "valor" }) ?? "";
  const codigoAtual = useWatch({ control, name: "codigo" }) ?? "";
  const medidasAtual = useWatch({ control, name: "medidas" }) ?? "";
  const qtdAtual = useWatch({ control, name: "qtd_estoque" }) ?? "";

  function onSubmit(values: ItemFormValues) {
    startTransition(async () => {
      if (!token) {
        toast.error("Sessão expirada. Entre novamente para continuar.");
        return;
      }

      const valorNumero =
        categoria === "pecas" ? parseBRLToNumber(values.valor) : null;

      const payload: ItemPayload = {
        categoria,
        codigo: values.codigo,
        nome: values.nome,
        modelo: values.modelo,
        descricao: values.descricao.length > 0 ? values.descricao : null,
        medidas: Number(values.medidas),
        qtd_estoque: Number(values.qtd_estoque),
        valor: valorNumero,
      };

      try {
        if (ehEdicao) {
          await updateItemApi(item.id, payload);
        } else {
          await createItemApi(payload);
        }

        notificarAtualizacaoEstoque();
        toast.success(ehEdicao ? "Item atualizado." : "Item cadastrado.");
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível salvar.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="size-4 text-primary" aria-hidden="true" />
            {ehEdicao ? "Editar item" : "Novo item"}
          </DialogTitle>
          <DialogDescription>
            {ehEdicao
              ? "Atualize os dados do item. O saldo gera um ajuste no histórico."
              : "Preencha os dados do item para incluí-lo no estoque."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                inputMode="numeric"
                placeholder="Somente números"
                value={codigoAtual}
                onChange={(event) =>
                  setValue("codigo", onlyDigits(event.target.value, 20), {
                    shouldDirty: true,
                  })
                }
                aria-invalid={errors.codigo ? true : undefined}
              />
              {errors.codigo ? (
                <p className="text-xs text-destructive">{errors.codigo.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Ex.: Diafragma 128"
                {...register("nome")}
                aria-invalid={errors.nome ? true : undefined}
              />
              {errors.nome ? (
                <p className="text-xs text-destructive">{errors.nome.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                placeholder="Ex.: Volkswagen 128"
                {...register("modelo")}
                aria-invalid={errors.modelo ? true : undefined}
              />
              {errors.modelo ? (
                <p className="text-xs text-destructive">
                  {errors.modelo.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                placeholder="Observação curta"
                {...register("descricao")}
              />
              {errors.descricao ? (
                <p className="text-xs text-destructive">
                  {errors.descricao.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="medidas">Medidas (mm)</Label>
              <Input
                id="medidas"
                inputMode="numeric"
                placeholder="Ex.: 128"
                value={medidasAtual}
                onChange={(event) =>
                  setValue("medidas", onlyDigits(event.target.value, 4), {
                    shouldDirty: true,
                  })
                }
                aria-invalid={errors.medidas ? true : undefined}
              />
              {errors.medidas ? (
                <p className="text-xs text-destructive">
                  {errors.medidas.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qtd_estoque">Quantidade</Label>
              <Input
                id="qtd_estoque"
                inputMode="numeric"
                placeholder="Ex.: 12"
                value={qtdAtual}
                onChange={(event) =>
                  setValue(
                    "qtd_estoque",
                    onlyDigits(event.target.value, 6),
                    { shouldDirty: true },
                  )
                }
                aria-invalid={errors.qtd_estoque ? true : undefined}
              />
              {errors.qtd_estoque ? (
                <p className="text-xs text-destructive">
                  {errors.qtd_estoque.message}
                </p>
              ) : null}
            </div>

            {mostrarValor ? (
              <div className="space-y-2">
                <Label htmlFor="valor">Valor unitário</Label>
                <Input
                  id="valor"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={valorAtual}
                  onChange={(event) =>
                    setValue("valor", maskBRL(event.target.value), {
                      shouldDirty: true,
                    })
                  }
                  aria-invalid={errors.valor ? true : undefined}
                />
                {errors.valor ? (
                  <p className="text-xs text-destructive">
                    {errors.valor.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {pending ? "Salvando..." : ehEdicao ? "Salvar alterações" : "Cadastrar item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
