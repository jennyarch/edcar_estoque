import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PerfilUsuario, SessaoAtual } from "@/types/auth";

export type { PerfilUsuario, SessaoAtual };

/**
 * Exige sessão válida; redireciona para `/login` quando não autenticado.
 * Cruza `auth.users` com o perfil (`public.profiles`), com fallback para
 * `user_metadata` quando o registro do perfil ainda não existe.
 */
export async function requireUser(): Promise<PerfilUsuario> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome, email, telefone, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const nomeMeta =
    typeof metadata.nome === "string" ? metadata.nome.trim() : "";
  const avatarMeta =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url.trim() : "";
  const email = user.email ?? perfil?.email ?? "";

  return {
    id: user.id,
    nome: perfil?.nome?.trim() || nomeMeta || email.split("@")[0] || "Usuário",
    email,
    telefone: perfil?.telefone ?? null,
    avatarUrl: perfil?.avatar_url || avatarMeta || null,
  };
}

/**
 * Resumo da sessão ativa (cookie gerenciado pelo `@supabase/ssr` e renovado
 * em `src/proxy.ts`). Nunca expõe access/refresh token.
 */
export async function getSessao(): Promise<SessaoAtual | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const agoraSegundos = Math.floor(Date.now() / 1000);
  const expiraEmSegundos = session.expires_at ?? null;

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    tipo: session.token_type === "bearer" ? "bearer" : session.token_type,
    expiraEm:
      expiraEmSegundos != null
        ? new Date(expiraEmSegundos * 1000).toISOString()
        : null,
    restantesEmSegundos:
      expiraEmSegundos != null ? expiraEmSegundos - agoraSegundos : null,
    contaCriadaEm: session.user.created_at ?? null,
    emailConfirmado: Boolean(session.user.email_confirmed_at),
  };
}
