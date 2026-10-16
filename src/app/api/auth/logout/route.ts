import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req);

  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
