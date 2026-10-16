import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EstoqueCliente } from "@/components/estoque/estoque-cliente";
import { EstoqueSkeleton } from "@/components/estoque/estoque-skeleton";
import { CATEGORIA_LABEL } from "@/lib/constants";
import { isCategoria } from "@/lib/validators";
import type { Categoria } from "@/types/item";

interface PageProps {
  params: Promise<{ categoria: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  if (!isCategoria(categoria)) return { title: "Estoque" };
  return { title: CATEGORIA_LABEL[categoria] };
}

export default async function EstoquePage({ params }: PageProps) {
  const { categoria } = await params;
  if (!isCategoria(categoria)) notFound();

  return (
    <Suspense fallback={<EstoqueSkeleton />}>
      <EstoqueCliente categoria={categoria as Categoria} />
    </Suspense>
  );
}