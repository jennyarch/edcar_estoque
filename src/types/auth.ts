/**
 * Autenticação e sessão.
 *
 * O token JWT é salvo no `localStorage` (chave `token`) e lido pelo
 * `SessionProvider` no navegador — sem cookies e sem middleware. O perfil
 * é reidratado a partir de `GET /api/auth/me`.
 */

/** Perfil enxuto como é usado na UI. */
export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatarUrl: string | null;
}