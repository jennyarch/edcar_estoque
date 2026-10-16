"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemFormDialog } from "@/components/estoque/item-form-dialog";
import type { Categoria } from "@/types/item";

export function NovoItemButton({ categoria }: { categoria: Categoria }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-label="Cadastrar novo item">
        <Plus aria-hidden="true" />
        Novo item
      </Button>
      <ItemFormDialog
        categoria={categoria}
        item={null}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
