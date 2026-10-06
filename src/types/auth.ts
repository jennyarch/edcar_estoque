/**
 * Schemas de autenticação e sessão.
 *
 * - `Perfil`: linha de `public.profiles` (dados do cadastro).
 * - `SessaoAtual`: resumo da sessão ativa lida do Supabase Auth
 *   (cookie de acesso renovado em `src/proxy.ts`).
 */

export type Perfil = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PerfilInsert = Omit<Perfil, "created_at" | "updated_at"> &
  Partial<Pick<Perfil, "created_at" | "updated_at">>;

export type PerfilUpdate = Partial<Omit<Perfil, "id" | "created_at" | "updated_at">>;

/** Perfil enxuto como é usado na UI (payload do layout). */
export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatarUrl: string | null;
}

/**
 * Resumo da sessão do Supabase Auth.
 * O token de acesso vive no cookie `sb-<projeto>-auth-token` e é renovado
 * pelo proxy; os dados abaixo vêm de `supabase.auth.getSession()`.
 */
export interface SessaoAtual {
  userId: string;
  email: string;
  /** Tipo do token: `bearer`. */
  tipo: "bearer" | string;
  /** Expiração do access token em ISO 8601 (quando informada pelo Auth). */
  expiraEm: string | null;
  /** Segundos restantes do access token no momento da leitura. */
  restantesEmSegundos: number | null;
  /** Conta criada em (ISO 8601). */
  contaCriadaEm: string | null;
  /** E-mail já confirmado pelo usuário. */
  emailConfirmado: boolean;
}
