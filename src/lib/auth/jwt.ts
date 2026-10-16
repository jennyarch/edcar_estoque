import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "JWT_SECRET não configurado. Defina JWT_SECRET nas variáveis de ambiente.",
  );
}

export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const tokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional().nullable(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

function secret(): string {
  return JWT_SECRET ?? "dev-secret-change-me";
}

export function signToken(payload: TokenPayload): {
  token: string;
  expiresAt: Date;
} {
  const token = jwt.sign(
    { userId: payload.userId, email: payload.email ?? null },
    secret(),
    { expiresIn: TOKEN_TTL_SECONDS },
  );
  return { token, expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000) };
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret()) as jwt.JwtPayload;
    const parsed = tokenPayloadSchema.safeParse({
      userId: decoded.userId ?? decoded.sub,
      email: decoded.email,
    });
    if (!parsed.success) return null;
    return parsed.data;
  } catch {
    return null;
  }
}
