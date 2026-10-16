import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import { AVATAR_MAX_CHARS } from "@/lib/constants";

const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe seu nome.")
    .max(80, "Máximo de 80 caracteres."),
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  telefone: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }, "Telefone inválido."),
  avatar: z
    .string()
    .trim()
    .max(AVATAR_MAX_CHARS, "Imagem muito grande. Escolha uma foto menor.")
    .optional()
    .refine((value) => {
      if (!value) return true;
      return (
        /^https?:\/\/\S+$/i.test(value) ||
        /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(value)
      );
    }, "Imagem inválida. Selecione um arquivo JPG, PNG ou WebP."),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cadastroSchema.safeParse(body);

    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message ?? "Dados inválidos.";
      return NextResponse.json({ error }, { status: 400 });
    }

    const { nome, email, telefone, avatar, senha } = parsed.data;
    const emailNormalizado = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: emailNormalizado },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }

    const senhaHash = await hashPassword(senha);

    const user = await prisma.user.create({
      data: {
        nome,
        email: emailNormalizado,
        telefone: telefone || null,
        avatarUrl: avatar || null,
        senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatarUrl: true,
      },
    });

    const { token, expiresAt } = signToken({
      userId: user.id,
      email: user.email,
    });

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro." },
      { status: 500 },
    );
  }
}
