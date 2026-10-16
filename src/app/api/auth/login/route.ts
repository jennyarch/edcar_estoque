import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message ?? "Dados inválidos.";
      return NextResponse.json({ error }, { status: 400 });
    }

    const { email, senha } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatarUrl: true,
        senhaHash: true,
      },
    });

    if (!user || !user.senhaHash) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 },
      );
    }

    const valid = await comparePassword(senha, user.senhaHash);
    if (!valid) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 },
      );
    }

    const { token, expiresAt } = signToken({
      userId: user.id,
      email: user.email,
    });

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Não foi possível fazer login." },
      { status: 500 },
    );
  }
}
