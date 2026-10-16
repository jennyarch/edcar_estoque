import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const baixaSchema = z.object({
  quantidade: z.coerce
    .number()
    .int("Informe uma quantidade inteira maior que zero.")
    .min(1, "Informe uma quantidade inteira maior que zero.")
    .max(999999, "Quantidade muito alta."),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id: itemId } = await params;

  try {
    const body = await req.json();
    const parsed = baixaSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message ?? "Dados inválidos.";
      return NextResponse.json({ error }, { status: 400 });
    }

    const quantidade = parsed.data.quantidade;

    const saldo = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id: itemId },
        select: { qtdEstoque: true },
      });

      if (!item) throw new Error("Item não encontrado.");

      if (item.qtdEstoque < quantidade) {
        throw new Error(
          `Saldo insuficiente (${item.qtdEstoque} unidade(s) em estoque).`,
        );
      }

      const novoSaldo = item.qtdEstoque - quantidade;

      await tx.item.update({
        where: { id: itemId },
        data: { qtdEstoque: novoSaldo },
      });

      await tx.stockMovement.create({
        data: {
          itemId,
          tipo: "baixa",
          quantidade,
          saldoAnterior: item.qtdEstoque,
          saldoPosterior: novoSaldo,
          userId: user.id,
        },
      });

      return novoSaldo;
    });

    return NextResponse.json({ saldo });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Não foi possível realizar a baixa.";
    const status = message === "Item não encontrado." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
