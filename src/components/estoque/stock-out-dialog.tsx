"use client";

import { useState, useTransition } from "react";
import { Loader2, MinusCircle } from "lucide-react";
import { toast } from "sonner";
import { useSessao } from "@/components/session/session-provider";
import { baixaItemApi } from "@/lib/api/client";
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
import { baixaFormSchema } from "@/lib/validators";
import { formatQuantidade, onlyDigits } from "@/lib/format";
import type { Item } from "@/types/item";

interface StockOutDialogProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockOutDialog({
  item,
  open,
  onOpenChange,
}: StockOutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <BaixaForm item={item} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function BaixaForm({
  item,
  onOpenChange,
}: {
  item: Item;
  onOpenChange: (open: boolean) => void;
}) {
  const { token } = useSessao();
  const [pending, startTransition] = useTransition();
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = baixaFormSchema.safeParse({ quantidade });
    if (!parsed.success) {
      setErro(parsed.error.issues[0]?.message ?? "Quantidade inválida.");
      return;
    }

    const valor = Number(parsed.data.quantidade);
    if (valor > item.qtd_estoque) {
      setErro(
        `Saldo insuficiente: há apenas ${formatQuantidade(item.qtd_estoque)} unidade(s).`,
      );
      return;
    }

    setErro(null);
    startTransition(async () => {
      if (!token) {
        toast.error("Sessão expirada. Entre novamente para continuar.");
        return;
      }

      try {
        const { saldo } = await baixaItemApi(item.id, valor);
        notificarAtualizacaoEstoque();
        toast.success(
          `Baixa de ${formatQuantidade(valor)} unidade(s) registrada. Novo saldo: ${formatQuantidade(saldo)}.`,
        );
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível dar baixa.",
        );
      }
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <MinusCircle className="size-4 text-destructive" aria-hidden="true" />
          Dar baixa
        </DialogTitle>
        <DialogDescription>
          {item.nome} · código {item.codigo} · saldo atual{" "}
          {formatQuantidade(item.qtd_estoque)} un.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="quantidade_baixa">Quantidade a dar baixa</Label>
          <Input
            id="quantidade_baixa"
            inputMode="numeric"
            autoFocus
            placeholder="Ex.: 2"
            value={quantidade}
            onChange={(event) =>
              setQuantidade(onlyDigits(event.target.value, 6))
            }
            aria-invalid={erro ? true : undefined}
          />
          {erro ? (
            <p className="text-xs text-destructive">{erro}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              A baixa é registrada no histórico com saldo anterior e posterior.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <MinusCircle aria-hidden="true" />
            )}
            {pending ? "Registrando..." : "Confirmar baixa"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
