import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  nome: string;
}

export function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

/**
 * Valida o JWT (Authorization: Bearer) e confirma que a sessão correspondente
 * existe e ainda não expirou em `sessions`.
 */
export async function getAuthenticatedUser(
  req: NextRequest,
): Promise<AuthenticatedUser | null> {
  const token = extractBearerToken(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    select: { expiresAt: true, user: { select: { id: true, email: true, nome: true } } },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  return session.user;
}
