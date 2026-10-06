"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  cadastroFormSchema,
  firstIssue,
  loginFormSchema,
} from "@/lib/validators";
import type { AuthState } from "@/types/actions";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Garante que exista uma linha em `public.profiles` para o usuário.
 * O trigger `on_auth_user_created` (migration 0002) já cria o registro;
 * aqui fica o fallback para projetos em que o trigger ainda não foi aplicado.
 * É uma operação best-effort: falhas não bloqueiam o login.
 */
async function garantirPerfil(
  supabase: ServerClient,
  user: User,
  extras?: { nome?: string; telefone?: string; avatar?: string },
): Promise<void> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const nomeMeta =
    typeof metadata.nome === "string" ? metadata.nome.trim() : "";
  const telefoneMeta =
    typeof metadata.telefone === "string" ? metadata.telefone.trim() : "";
  const avatarMeta =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url.trim() : "";

  const nome =
    extras?.nome?.trim() ||
    nomeMeta ||
    user.email?.split("@")[0] ||
    "Usuário";

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      nome,
      email: user.email ?? null,
      telefone: extras?.telefone?.trim() || telefoneMeta || null,
      avatar_url: extras?.avatar?.trim() || avatarMeta || null,
    },
    { onConflict: "id" },
  );
}

function mapAuthError(message: string): string {
  const text = message.toLowerCase();

  if (text.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (text.includes("already registered"))
    return "Este e-mail já está cadastrado.";
  if (text.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (text.includes("rate limit") || text.includes("too many"))
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  if (text.includes("at least 6"))
    return "A senha deve ter ao menos 6 caracteres.";
  if (text.includes("password")) return "Não foi possível validar a senha.";
  if (text.includes("not found")) return "Usuário não encontrado.";

  return message;
}

function revalidarApp(): void {
  revalidatePath("/", "layout");
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = {
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
  };

  const parsed = loginFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    return { error: mapAuthError(error.message), message: null };
  }

  if (data.user) {
    await garantirPerfil(supabase, data.user);
  }

  revalidarApp();
  redirect("/");
}

export async function cadastroAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    avatar: String(formData.get("avatar") ?? ""),
    senha: String(formData.get("senha") ?? ""),
  };

  const parsed = cadastroFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: firstIssue(parsed.error), message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.senha,
    options: {
      data: {
        nome: parsed.data.nome,
        full_name: parsed.data.nome,
        telefone: parsed.data.telefone,
        avatar_url: parsed.data.avatar || null,
      },
    },
  });

  if (error) {
    return { error: mapAuthError(error.message), message: null };
  }

  if (data.session) {
    if (data.user) {
      await garantirPerfil(supabase, data.user, {
        nome: parsed.data.nome,
        telefone: parsed.data.telefone,
        avatar: parsed.data.avatar,
      });
    }
    revalidarApp();
    redirect("/");
  }

  return {
    error: null,
    message:
      "Cadastro criado! Confirme seu e-mail para acessar o sistema.",
  };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidarApp();
  redirect("/login");
}
