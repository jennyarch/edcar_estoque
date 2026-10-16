import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { toItemDTO } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS, type Categoria } from "@/types/item";

const updateSchema = z.object({
  categoria: z.enum(CATEGORIAS),
  codigo: z
    .string()
    .trim()
    .min(1, "Informe o código.")
    // .regex(/^\d+$/, "O código deve conter apenas números.")
    .max(20, "Máximo de 20 dígitos."),
  nome: z.string().trim().min(1, "Informe o nome.").max(80, "Máximo de 80 caracteres."),
  modelo: z.string().trim().min(1, "Informe o modelo.").max(36, "Máximo de 36 caracteres."),
  descricao: z
    .string()
    .trim()
    .max(50, "Máximo de 50 caracteres.")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v ?? null)),
  medidas: z.coerce.number().int().min(1, "Medida entre 1 e 5000 mm.").max(5000, "Medida entre 1 e 5000 mm."),
  qtd_estoque: z.coerce.number().int().min(0).max(999999, "Quantidade máxima de 999999."),
  valor: z.number().gt(0).nullable().optional(),
});

function toValor(categoria: Categoria, valor?: number | null) {
  if (categoria === "pecas") {
    if (!valor || valor <= 0) return null;
    return valor;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ item: toItemDTO(item) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar item." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message ?? "Dados inválidos.";
      return NextResponse.json({ error }, { status: 400 });
    }

    const data = parsed.data;
    const categoria = data.categoria as Categoria;
    const valor = toValor(categoria, data.valor);

    if (categoria === "pecas" && (!valor || valor <= 0)) {
      return NextResponse.json(
        { error: "Informe um valor unitário válido." },
        { status: 400 },
      );
    }

    const atual = await prisma.item.findUnique({ where: { id } });
    if (!atual) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        categoria,
        codigo: data.codigo,
        nome: data.nome,
        modelo: data.modelo,
        descricao: data.descricao ?? null,
        medidas: data.medidas,
        qtdEstoque: data.qtd_estoque,
        valor,
      },
    });

    if (item.qtdEstoque !== atual.qtdEstoque) {
      await prisma.stockMovement.create({
        data: {
          itemId: item.id,
          tipo: "ajuste",
          quantidade: Math.abs(item.qtdEstoque - atual.qtdEstoque),
          saldoAnterior: atual.qtdEstoque,
          saldoPosterior: item.qtdEstoque,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ item: toItemDTO(item) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar item." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const atual = await prisma.item.findUnique({ where: { id } });
    if (!atual) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir item." }, { status: 500 });
  }
}
