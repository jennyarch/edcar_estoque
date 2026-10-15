import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase do navegador (supabase-js puro).
 * A sessão é salva no `localStorage` (storageKey abaixo) — sem cookies,
 * sem middleware. O servidor não lê a sessão; para operações RLS
 * no servidor, o token é enviado às Server Actions (ver criarClienteAutenticado).
 */
export const STORAGE_KEY = "edcar-sessao";

let cliente: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function getSupabase() {
  const { url, publishableKey } = getSupabaseEnv();

  if (!cliente) {
    cliente = createSupabaseClient<Database>(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: STORAGE_KEY,
      },
    });
  }

  return cliente;
}

/** Access token da sessão salva no localStorage (para chamadas server-side). */
export async function obterAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  return session?.access_token ?? null;
}