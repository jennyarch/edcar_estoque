import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { toItemDTO, toMovimentoDTO } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";
import { ESTOQUE_BAIXO } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const [itens, movimentos] = await prisma.$transaction([
      prisma.item.findMany({ orderBy: { nome: "asc" } }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          item: { select: { nome: true, codigo: true, categoria: true } },
        },
      }),
    ]);

    const baixos = itens
      .filter((item) => item.qtdEstoque <= ESTOQUE_BAIXO)
      .sort(
        (a, b) =>
          a.qtdEstoque - b.qtdEstoque || a.nome.localeCompare(b.nome),
      )
      .slice(0, 6);

    const valorEstoque = itens.reduce((total, item) => {
      if (item.categoria !== "pecas" || !item.valor) return total;
      return total + Number(item.valor) * item.qtdEstoque;
    }, 0);

    return NextResponse.json({
      totalItens: itens.length,
      totalUnidades: itens.reduce((acc, item) => acc + item.qtdEstoque, 0),
      itensBaixo: itens.filter((item) => item.qtdEstoque <= ESTOQUE_BAIXO).length,
      valorEstoque,
      baixos: baixos.map(toItemDTO),
      movimentacoes: movimentos.map((mov) =>
        toMovimentoDTO(mov, {
          nome: mov.item.nome,
          codigo: mov.item.codigo,
          categoria: mov.item.categoria,
        }),
      ),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao carregar o resumo." },
      { status: 500 },
    );
  }
}
