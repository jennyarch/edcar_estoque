/**
 * Schemas de autenticação e sessão.
 *
 * - `Perfil`: linha de `public.profiles` (dados do cadastro).
 * - `PerfilUsuario`: perfil enxuto exposto na UI (lido do cliente Supabase).
 *
 * A sessão é salva no `localStorage` (storageKey `edcar-sessao`) e lida
 * pelo `SessionProvider` no navegador — sem cookies e sem middleware.
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

/** Perfil enxuto como é usado na UI. */
export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatarUrl: string | null;
}