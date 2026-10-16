"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSessao } from "@/components/session/session-provider";
import { deleteItemApi } from "@/lib/api/client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { notificarAtualizacaoEstoque } from "@/lib/estoque-events";
import type { Item } from "@/types/item";

interface ConfirmDeleteDialogProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDeleteDialog({
  item,
  open,
  onOpenChange,
}: ConfirmDeleteDialogProps) {
  const { token } = useSessao();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      if (!token) {
        toast.error("Sessão expirada. Entre novamente para continuar.");
        return;
      }

      try {
        await deleteItemApi(item.id);
        notificarAtualizacaoEstoque();
        toast.success(`"${item.nome}" removido do estoque.`);
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Não foi possível excluir.",
        );
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" aria-hidden="true" />
            Excluir item?
          </AlertDialogTitle>
          <AlertDialogDescription>
            O item <span className="font-medium text-foreground">{item.nome}</span>{" "}
            (código {item.codigo}) será removido permanentemente. As
            movimentações já registradas permanecem no histórico.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-medium text-white outline-none hover:bg-destructive/90 focus-visible:ring-3 focus-visible:ring-destructive/40 disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            {pending ? "Excluindo..." : "Excluir"}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
